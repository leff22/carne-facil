import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import QRCode from "qrcode";
import { supabase } from "./supabaseClient.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Store para conexões SSE (Server-Sent Events)

// Rota para listar produtos
app.get('/products', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    // Processar produtos para incluir URLs das imagens
    const productsWithImages = products.map(product => {
      let imageUrl = null;
      
      // Se tem image_url, usar ela
      if (product.image_url) {
        imageUrl = product.image_url;
      }
      // Se não tem image_url mas tem image_placeholder, gerar URL do Storage
      else if (product.image_placeholder && !product.image_placeholder.includes('🥩') && !product.image_placeholder.includes('🍗') && !product.image_placeholder.includes('🌭')) {
        // Assumindo que image_placeholder contém o nome do arquivo
        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(product.image_placeholder);
        imageUrl = data.publicUrl;
      }

      return {
        ...product,
        image_url: imageUrl,
        // Manter o placeholder como fallback
        image_placeholder: product.image_placeholder
      };
    });

    res.json({
      success: true,
      products: productsWithImages || []
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

const sseConnections = new Map();
const globalSSEConnections = new Set();

// Armazenar dados dos pedidos temporariamente
const orderData = new Map();

// Middleware para SSE
app.use('/events', (req, res, next) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  next();
});

// Rota para SSE global (para tela da TV e painel do açougueiro)
app.get('/events', (req, res) => {
  // Adicionar conexão global
  globalSSEConnections.add(res);
  
  // Enviar evento inicial
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to global events' })}\n\n`);
  
  // Cleanup quando conexão fechar
  req.on('close', () => {
    globalSSEConnections.delete(res);
  });
});

// Rota para SSE (Server-Sent Events) - notificações em tempo real para tickets específicos
app.get('/events/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  
  // Adicionar conexão ao store
  sseConnections.set(ticketId, res);
  
  // Enviar evento inicial
  res.write(`data: ${JSON.stringify({ type: 'connected', ticketId })}\n\n`);
  
  // Cleanup quando conexão fechar
  req.on('close', () => {
    sseConnections.delete(ticketId);
  });
});

// Função para notificar clientes via SSE
const notifyTicketUpdate = (ticketId, data) => {
  // Notificar conexão específica do ticket
  const connection = sseConnections.get(ticketId);
  if (connection) {
    connection.write(`data: ${JSON.stringify({ type: 'status_update', ...data })}\n\n`);
  }
  
  // Notificar todas as conexões globais (TV, painel do açougueiro)
  globalSSEConnections.forEach(connection => {
    try {
      connection.write(`data: ${JSON.stringify({ type: 'ticket_updated', ticketId, ...data })}\n\n`);
    } catch (error) {
      // Remove conexões mortas
      globalSSEConnections.delete(connection);
    }
  });
};

// Rota raiz para testar se o servidor está rodando
app.get("/", (req, res) => {
  res.send("🚀 API do Açougue está funcionando!");
});

// Teste: listar lojas
app.get("/stores", async (req, res) => {
  const { data, error } = await supabase.from("stores").select("*");

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// Teste: criar loja
app.post("/stores", async (req, res) => {
  const { name } = req.body;

  const { data, error } = await supabase
    .from("stores")
    .insert([{ name }])
    .select();

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// Criar um pedido + senha sequencial
app.post("/orders", async (req, res) => {
  try {
    const { customer_name, store_id, items } = req.body;

    // Validar dados obrigatórios
    if (!customer_name || !store_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Nome do cliente, loja e itens são obrigatórios' 
      });
    }

    // Buscar todos os produtos do banco de dados
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('active', true);

    if (productsError) {
      throw productsError;
    }

    // Validar itens do pedido
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ 
          error: 'Cada item deve ter product_id e quantity válidos' 
        });
      }
      
      // Verificar se o produto existe
      const product = products.find(p => p.id === item.product_id);
      if (!product) {
        return res.status(400).json({ 
          error: `Produto com ID ${item.product_id} não encontrado` 
        });
      }
    }

    // Calcular total do pedido
    let total = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      
      return {
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal
      };
    });

    // Buscar próximo número de ticket
    const { data: lastTicket } = await supabase
      .from('tickets')
      .select('number')
      .order('number', { ascending: false })
      .limit(1);

    const nextNumber = lastTicket && lastTicket.length > 0 ? lastTicket[0].number + 1 : 1;

    // Criar ticket diretamente com os dados do pedido
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .insert([
        {
          number: nextNumber,
          status: 'waiting'
        }
      ])
      .select()
      .single();

    if (ticketError) {
      throw ticketError;
    }

    // Armazenar dados do pedido temporariamente
    orderData.set(ticketData.id, {
      customer_name,
      total_amount: total,
      items: orderItems
    });

    // Buscar dados completos do ticket criado
    const { data: completeTicket, error: fetchError } = await supabase
      .from('tickets')
      .select(`
        *
      `)
      .eq('id', ticketData.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Notificar via SSE
    notifyTicketUpdate(ticketData.id, {
      type: 'ticket_created',
      ticket: completeTicket
    });

    res.json({
      success: true,
      ticket: {
        ...completeTicket,
        customer_name,
        total_amount: total,
        items: orderItems
      },
      message: 'Pedido criado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



// Teste: criar pedido completo com QR Code
app.post("/test-order", async (req, res) => {
  try {
    // 1) Criar uma loja de teste (se não existir)
    let { data: store } = await supabase
      .from("stores")
      .select("*")
      .eq("name", "Açougue Teste")
      .single();

    if (!store) {
      const { data: newStore, error: storeError } = await supabase
        .from("stores")
        .insert([{ name: "Açougue Teste" }])
        .select()
        .single();
      
      if (storeError) return res.status(400).json({ error: storeError });
      store = newStore;
    }

    // 2) Criar pedido de teste
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        { 
          store_id: store.id, 
          customer_name: "Cliente Teste" 
        }
      ])
      .select()
      .single();

    if (orderError) return res.status(400).json({ error: orderError });

    // 3) Gerar senha sequencial
    const { data: lastTicket } = await supabase
      .from("tickets")
      .select("number")
      .eq("store_id", store.id)
      .order("number", { ascending: false })
      .limit(1)
      .single();

    const nextNumber = lastTicket ? lastTicket.number + 1 : 1;

    // 4) Criar ticket com status inicial
    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .insert([
        { 
          store_id: store.id, 
          order_id: orderData.id, 
          number: nextNumber,
          status: 'waiting'
        }
      ])
      .select()
      .single();

    if (ticketError) return res.status(400).json({ error: ticketError });

    // 5) Gerar QR Code com URL direta
    const ticketUrl = `http://localhost:3000/ticket/${ticketData.id}`;
    const qrCodeDataURL = await QRCode.toDataURL(ticketUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      message: "Pedido de teste criado com sucesso!",
      order: orderData,
      ticket: ticketData,
      store: store,
      qrCode: qrCodeDataURL,
      qr_url: ticketUrl
    });

    // Notificar sobre novo ticket criado
    notifyTicketUpdate(ticketData.id.toString(), {
      id: ticketData.id,
      number: ticketData.number,
      status: ticketData.status,
      created_at: ticketData.created_at
    });

  } catch (err) {
    res.status(500).json({ error: "Erro no teste", details: err.message });
  }
});

// Gerar QR Code para um ticket existente
app.get("/qrcode/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Buscar informações do ticket
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select(`
        *,
        orders (
          customer_name,
          stores (name)
        )
      `)
      .eq("id", ticketId)
      .single();

    if (error || !ticket) {
      return res.status(404).json({ error: "Ticket não encontrado" });
    }

    // Criar URL para a página da senha
    const ticketUrl = `http://localhost:3000/ticket/${ticket.id}`;

    // Gerar QR Code com a URL direta e opções otimizadas
    const qrCodeDataURL = await QRCode.toDataURL(ticketUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      ticket: ticket,
      qrCode: qrCodeDataURL,
      qr_url: ticketUrl
    });

  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar QR Code", details: err.message });
  }
});

// Rota para buscar dados do ticket (para a página do cliente)
app.get('/ticket/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Buscar dados do pedido armazenados temporariamente
    const storedOrderData = orderData.get(parseInt(id));

    res.json({
      id: ticket.id,
      number: ticket.number,
      status: ticket.status || 'waiting',
      created_at: ticket.created_at,
      customer_name: storedOrderData?.customer_name || 'Cliente',
      total_amount: storedOrderData?.total_amount || 0,
      items: storedOrderData?.items || [],
      store: {
        name: 'Açougue Carne Fácil'
      }
    });

  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar status do ticket (para o açougueiro)
app.put('/ticket/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('=== PUT /ticket/:id/status ===');
    console.log('ID recebido:', id);
    console.log('Status recebido:', status);

    // Validar status
    const validStatuses = ['waiting', 'preparing', 'ready', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    console.log('✅ Status válido:', status);

    // Primeiro, vamos verificar se o ticket existe
    const { data: existingTicket, error: findError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    console.log('Ticket encontrado:', existingTicket);
    console.log('Erro na busca:', findError);

    if (findError || !existingTicket) {
      console.log('Ticket não encontrado no banco');
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Log para debug - pode ser removido depois
    console.log('=== ATUALIZANDO STATUS ===');
    console.log('Ticket ID:', id);
    console.log('Status atual:', existingTicket.status);
    console.log('Novo status:', status);

    // Vamos também tentar uma abordagem mais simples
    console.log('=== TESTANDO VALORES PERMITIDOS ===');
    const testStatuses = ['waiting', 'preparing', 'ready', 'completed', 'done', 'finished'];
    for (const testStatus of testStatuses) {
      console.log(`Testando status: ${testStatus}`);
    }

    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({ 
        status: status
      })
      .eq('id', id)
      .select('*')
      .single();

    console.log('Resultado da atualização:', ticket);
    console.log('Erro na atualização:', error);
    console.log('Erro detalhado:', JSON.stringify(error, null, 2));

    if (error) {
      console.log('Erro ao atualizar:', error);
      return res.status(500).json({ error: 'Erro ao atualizar ticket: ' + error.message });
    }

    // Notificar cliente via SSE
    notifyTicketUpdate(id, {
      id: ticket.id,
      number: ticket.number,
      status: ticket.status,
      created_at: ticket.created_at
    });

    console.log('Ticket atualizado com sucesso');
    res.json({
      success: true,
      ticket: {
        id: ticket.id,
        number: ticket.number,
        status: ticket.status,
        created_at: ticket.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar todos os tickets (para o painel do açougueiro)
app.get('/tickets', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: true });

    // Filtrar por status se fornecido
    if (status) {
      query = query.eq('status', status);
    }

    const { data: tickets, error } = await query;

    if (error) {
      throw error;
    }

    const formattedTickets = tickets.map(ticket => {
      // Buscar dados do pedido armazenados temporariamente
      const storedOrderData = orderData.get(ticket.id);
      
      return {
        id: ticket.id,
        number: ticket.number,
        status: ticket.status || 'waiting',
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        order: {
          customer_name: storedOrderData?.customer_name || 'Cliente'
        },
        store: {
          name: 'Açougue Carne Fácil'
        },
        // Adicionar dados dos produtos e total
        items: storedOrderData?.items || [],
        total_amount: storedOrderData?.total_amount || 0,
        customer_name: storedOrderData?.customer_name || 'Cliente'
      };
    });

    res.json({
      success: true,
      tickets: formattedTickets
    });

  } catch (error) {
    console.error('Erro ao listar tickets:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para resetar todas as senhas (Admin)
app.delete('/admin/reset-tickets', async (req, res) => {
  try {
    console.log('=== RESETANDO TODAS AS SENHAS ===');
    
    // Buscar todos os tickets primeiro
    const { data: allTickets, error: fetchError } = await supabase
      .from('tickets')
      .select('id');

    if (fetchError) {
      console.error('Erro ao buscar tickets:', fetchError);
      return res.status(500).json({ error: 'Erro ao buscar tickets: ' + fetchError.message });
    }

    console.log(`Encontrados ${allTickets?.length || 0} tickets para deletar`);

    let deletedCount = 0;

    // Se há tickets, deletar um por um (mais confiável)
    if (allTickets && allTickets.length > 0) {
      for (const ticket of allTickets) {
        const { error: deleteError } = await supabase
          .from('tickets')
          .delete()
          .eq('id', ticket.id);

        if (deleteError) {
          console.error(`Erro ao deletar ticket ${ticket.id}:`, deleteError);
        } else {
          deletedCount++;
          console.log(`Ticket ${ticket.id} deletado com sucesso`);
        }
      }
    }

    console.log(`${deletedCount} senhas foram deletadas com sucesso`);
    
    // Notificar todas as conexões globais sobre o reset
    globalSSEConnections.forEach(connection => {
      try {
        connection.write(`data: ${JSON.stringify({ 
          type: 'tickets_reset', 
          message: `${deletedCount} senhas foram resetadas`,
          count: deletedCount 
        })}\n\n`);
      } catch (error) {
        console.error('Erro ao notificar SSE:', error);
        globalSSEConnections.delete(connection);
      }
    });

    res.json({
      success: true,
      message: `${deletedCount} senhas foram resetadas com sucesso`,
      deletedCount: deletedCount
    });

  } catch (error) {
    console.error('Erro ao resetar senhas:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`✅ API rodando em http://localhost:${process.env.PORT}`)
);