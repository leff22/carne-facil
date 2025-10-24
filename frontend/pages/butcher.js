import { useState, useEffect } from 'react';

export default function ButcherPanel() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  // Buscar todos os tickets
  const fetchTickets = async () => {
    try {
      const response = await fetch('http://localhost:4000/tickets');
      const data = await response.json();
      
      if (response.ok) {
        // O backend retorna { success: true, tickets: [...] }
        setTickets(data.tickets || []);
        setError(null);
      } else {
        setError(data.error || 'Erro ao carregar tickets');
        setTickets([]);
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status do ticket
  const updateTicketStatus = async (ticketId, newStatus) => {
    console.log('=== ATUALIZANDO STATUS ===');
    console.log('ID:', ticketId);
    console.log('Novo status:', newStatus);
    
    setUpdating(ticketId);
    
    try {
      const response = await fetch(`http://localhost:4000/ticket/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        // Atualizar o ticket na lista local
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId 
              ? { ...ticket, status: newStatus }
              : ticket
          )
        );
        setError(null);
        console.log('✅ Status atualizado com sucesso!');
      } else {
        console.error('❌ Erro na resposta:', data);
        setError(data.error || 'Erro ao atualizar status');
      }
    } catch (err) {
      console.error('❌ Erro de conexão:', err);
      setError('Erro de conexão: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  // Carregar tickets ao montar o componente
  useEffect(() => {
    fetchTickets();
    
    // Configurar SSE para atualizações em tempo real
    const eventSource = new EventSource('http://localhost:4000/events');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ticket_updated' || data.type === 'connected' || data.type === 'tickets_reset') {
        fetchTickets(); // Recarregar todos os tickets quando houver atualização
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
    };
    
    // Atualizar a cada 30 segundos como fallback
    const interval = setInterval(fetchTickets, 30000);
    
    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, []);

  // Função para obter a cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter o texto do status
  const getStatusText = (status) => {
    switch (status) {
      case 'waiting': return 'Aguardando';
      case 'preparing': return 'Preparando';
      case 'completed': return 'Pronto';
      default: return status;
    }
  };

  // Função para obter as próximas ações possíveis
  const getNextActions = (currentStatus) => {
    switch (currentStatus) {
      case 'waiting': return [{ status: 'preparing', label: 'Iniciar Preparo' }];
      case 'preparing': return [{ status: 'completed', label: 'Marcar como Pronto' }];
      case 'completed': return [];
      default: return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            🥩 Painel do Açougueiro
          </h1>
          <button
            onClick={fetchTickets}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            🔄 Atualizar
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {/* Filtrar apenas tickets pendentes (não completed) */}
        {tickets.filter(ticket => ticket.status !== 'completed').length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Nenhum ticket pendente</p>
            <p className="text-gray-400 text-sm mt-2">
              Todos os pedidos foram finalizados ou não há pedidos no momento
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tickets
              .filter(ticket => ticket.status !== 'completed') // Filtrar tickets finalizados
              .map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      Senha #{ticket.number}
                    </h3>
                    <p className="text-gray-600">{ticket.customer_name || ticket.order?.customer_name || 'Cliente'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                    {getStatusText(ticket.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Cliente:</strong> {ticket.customer_name || ticket.order?.customer_name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Loja:</strong> {ticket.store?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Criado:</strong> {new Date(ticket.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Lista de Produtos */}
                {ticket.items && ticket.items.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">Produtos:</h4>
                    <div className="space-y-1">
                      {ticket.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          <span>{item.quantity}x {item.product_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {getNextActions(ticket.status).map((action) => (
                    <button
                      key={action.status}
                      onClick={() => {
                        console.log('=== DEBUG CLICK ===');
                        console.log('Ticket ID:', ticket.id);
                        console.log('Status atual:', ticket.status);
                        console.log('Novo status:', action.status);
                        console.log('URL:', `http://localhost:4000/ticket/${ticket.id}/status`);
                        updateTicketStatus(ticket.id, action.status);
                      }}
                      disabled={updating === ticket.id}
                      className={`w-full font-bold py-2 px-4 rounded-lg transition-colors ${
                        action.status === 'completed' 
                          ? 'bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white'
                          : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white'
                      }`}
                    >
                      {updating === ticket.id ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Atualizando...
                        </span>
                      ) : (
                        action.label
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estatísticas - apenas tickets pendentes */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-100 rounded-lg p-4 text-center">
            <h3 className="text-lg font-semibold text-yellow-800">Aguardando</h3>
            <p className="text-2xl font-bold text-yellow-900">
              {tickets.filter(t => t.status === 'waiting').length}
            </p>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <h3 className="text-lg font-semibold text-blue-800">Preparando</h3>
            <p className="text-2xl font-bold text-blue-900">
              {tickets.filter(t => t.status === 'preparing').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}