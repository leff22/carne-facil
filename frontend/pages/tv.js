// Função para formatar o número do ticket
  const formatTicketNumber = (ticket) => {
    // Usar o campo 'number' se existir, senão usar o ID formatado
    const displayNumber = ticket.number || ticket.id;
    return String(displayNumber).padStart(3, '0');
  };import { useState, useEffect } from 'react';

export default function TVDisplay() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar horário a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Buscar tickets
  const fetchTickets = async () => {
    console.log('Buscando tickets...');
    try {
      const response = await fetch('http://localhost:4000/tickets');
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Tickets recebidos:', data);
      
      if (response.ok) {
        // O backend retorna { success: true, tickets: [...] } - usar data.tickets
        const ticketsData = data.tickets || data || [];
        setTickets(ticketsData);
        setError(null);
        console.log('Tickets atualizados no estado:', ticketsData.length, 'tickets');
      } else {
        setError(data.error || 'Erro ao carregar tickets');
        console.error('Erro na resposta:', data.error);
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
      console.error('Erro de conexão:', err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar tickets inicialmente e configurar atualização automática
  useEffect(() => {
    console.log('Iniciando carregamento inicial de tickets...');
    fetchTickets();
    
    // Atualizar a cada 5 segundos
    console.log('Configurando auto-refresh a cada 5 segundos...');
    const interval = setInterval(() => {
      console.log('Auto-refresh executando...');
      fetchTickets();
    }, 5000);
    
    return () => {
      console.log('Limpando interval de auto-refresh');
      clearInterval(interval);
    };
  }, []);

  // Configurar SSE para atualizações em tempo real
  useEffect(() => {
    console.log('Conectando ao SSE...');
    const eventSource = new EventSource('http://localhost:4000/events');
    
    eventSource.onopen = () => {
      console.log('SSE conectado com sucesso');
    };
    
    eventSource.onmessage = (event) => {
      console.log('Evento SSE recebido:', event.data);
      const data = JSON.parse(event.data);
      if (data.type === 'ticket_updated' || data.type === 'connected' || data.type === 'tickets_reset') {
        console.log('Recarregando tickets devido ao evento:', data.type);
        fetchTickets(); // Recarregar todos os tickets quando houver atualização
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      console.log('Estado da conexão SSE:', eventSource.readyState);
    };

    return () => {
      console.log('Fechando conexão SSE');
      eventSource.close();
    };
  }, []);

  // Filtrar tickets por status (garantir que tickets é um array)
  const ticketsArray = Array.isArray(tickets) ? tickets : [];
  console.log('Tickets no estado atual:', tickets);
  console.log('Tickets como array:', ticketsArray);
  
  const waitingTickets = ticketsArray.filter(t => t.status === 'waiting');
  const preparingTickets = ticketsArray.filter(t => t.status === 'preparing');
  const completedTickets = ticketsArray.filter(t => t.status === 'completed');
  
  console.log('Tickets filtrados:', {
    waiting: waitingTickets.length,
    preparing: preparingTickets.length,
    completed: completedTickets.length
  });

  // Função para formatar horário de forma segura
  const formatTime = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      // Verificar se a data é válida
      if (isNaN(date.getTime())) return null;
      
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-bold text-center flex-1">
          🥩 CARNE FÁCIL - PAINEL DE SENHAS
        </h1>
        <div className="text-right">
          <div className="text-2xl font-mono">
            {currentTime.toLocaleTimeString('pt-BR')}
          </div>
          <div className="text-lg text-gray-400">
            {currentTime.toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      {/* Grid de Status */}
      <div className="grid grid-cols-3 gap-8 h-[calc(100vh-200px)]">
        
        {/* Na Fila */}
        <div className="bg-yellow-800 rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-yellow-100 mb-2">
              🕐 NA FILA
            </h2>
            <div className="text-5xl font-bold text-yellow-200">
              {waitingTickets.length}
            </div>
          </div>
          
          <div className="space-y-3 max-h-[calc(100%-120px)] overflow-y-auto">
            {waitingTickets.length === 0 ? (
              <div className="text-center text-yellow-200 text-xl py-8">
                Nenhuma senha na fila
              </div>
            ) : (
              waitingTickets.map((ticket) => (
                <div key={ticket.id} className="bg-yellow-700 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-100">
                    #{formatTicketNumber(ticket)}
                  </div>
                  {formatTime(ticket.created_at) && (
                    <div className="text-sm text-yellow-200 mt-1">
                      {formatTime(ticket.created_at)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Em Preparo */}
        <div className="bg-blue-800 rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-blue-100 mb-2">
              👨‍🍳 EM PREPARO
            </h2>
            <div className="text-5xl font-bold text-blue-200">
              {preparingTickets.length}
            </div>
          </div>
          
          <div className="space-y-3 max-h-[calc(100%-120px)] overflow-y-auto">
            {preparingTickets.length === 0 ? (
              <div className="text-center text-blue-200 text-xl py-8">
                Nenhuma senha em preparo
              </div>
            ) : (
              preparingTickets.map((ticket) => (
                <div key={ticket.id} className="bg-blue-700 rounded-lg p-4 text-center animate-pulse">
                  <div className="text-3xl font-bold text-blue-100">
                    #{formatTicketNumber(ticket)}
                  </div>
                  {formatTime(ticket.updated_at) && (
                    <div className="text-sm text-blue-200 mt-1">
                      {formatTime(ticket.updated_at)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pronto para Retirar */}
        <div className="bg-green-800 rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-green-100 mb-2">
              ✅ PRONTO PARA RETIRAR
            </h2>
            <div className="text-5xl font-bold text-green-200">
              {completedTickets.length}
            </div>
          </div>
          
          <div className="space-y-3 max-h-[calc(100%-120px)] overflow-y-auto">
            {completedTickets.length === 0 ? (
              <div className="text-center text-green-200 text-xl py-8">
                Nenhuma senha pronta
              </div>
            ) : (
              completedTickets.map((ticket) => (
                <div key={ticket.id} className="bg-green-700 rounded-lg p-4 text-center animate-bounce">
                  <div className="text-3xl font-bold text-green-100">
                    #{formatTicketNumber(ticket)}
                  </div>
                  {formatTime(ticket.updated_at) && (
                    <div className="text-sm text-green-200 mt-1">
                      Pronto às {formatTime(ticket.updated_at)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer com informações */}
      <div className="mt-8 text-center text-gray-400">
        <p className="text-lg">
          Acompanhe sua senha pelo QR Code • Atualização automática a cada 5 segundos
        </p>
      </div>
    </div>
  );
}