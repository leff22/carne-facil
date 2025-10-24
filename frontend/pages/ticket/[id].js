import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TicketPage() {
  const router = useRouter();
  const { id } = router.query;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  // Buscar dados do ticket (apenas uma vez)
  const fetchTicket = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`http://localhost:4000/ticket/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setTicket(data);
        setError(null);
      } else {
        setError(data.error || 'Ticket não encontrado');
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Conectar ao SSE para atualizações em tempo real
  useEffect(() => {
    if (!id) return;

    // Buscar dados iniciais
    fetchTicket();

    // Conectar ao SSE
    const eventSource = new EventSource(`http://localhost:4000/events/${id}`);
    
    eventSource.onopen = () => {
      setConnected(true);
      console.log('Conectado ao servidor de notificações');
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'status_update') {
        setTicket(prevTicket => ({
          ...prevTicket,
          status: data.status,
          updated_at: data.updated_at
        }));
        
        // Mostrar notificação visual
        if (data.status === 'completed') {
          // Pode adicionar notificação do browser aqui
          if (Notification.permission === 'granted') {
            new Notification('Pedido Pronto!', {
              body: `Sua senha #${data.number} está pronta para retirada`,
              icon: '/favicon.ico'
            });
          }
        }
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      console.log('Erro na conexão SSE');
    };

    // Cleanup
    return () => {
      eventSource.close();
    };
  }, [id]);

  // Solicitar permissão para notificações
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sua senha...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Erro</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting': return 'Aguardando';
      case 'preparing': return 'Preparando';
      case 'completed': return 'Pronto!';
      default: return 'Aguardando';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🥩 {ticket.store?.name || 'Açougue'}
          </h1>
          <p className="text-gray-600">Acompanhe seu pedido em tempo real</p>
        </div>

        {/* Senha Principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div className="mb-4">
            <span className="text-gray-500 text-lg">Sua senha</span>
          </div>
          <div className="text-8xl font-bold text-blue-600 mb-4">
            #{ticket.number}
          </div>
          <div className={`inline-flex items-center px-6 py-3 rounded-full text-white font-semibold ${getStatusColor(ticket.status)}`}>
            <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
            {getStatusText(ticket.status)}
          </div>
        </div>

        {/* Informações do Pedido */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Detalhes do Pedido</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-medium">{ticket.order?.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pedido:</span>
              <span className="font-medium">#{ticket.order?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Horário:</span>
              <span className="font-medium">
                {new Date(ticket.created_at).toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Status Steps */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Progresso do Pedido</h3>
          <div className="flex items-center justify-between">
            {['waiting', 'preparing', 'completed'].map((step, index) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                  ticket.status === step ? getStatusColor(step) : 
                  (step === 'preparing' && ticket.status === 'completed') || 
                  (step === 'waiting' && ['preparing', 'completed'].includes(ticket.status)) ? 
                  'bg-green-500' : 'bg-gray-300'
                }`}>
                  {ticket.status === step ? (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  ) : (
                    (step === 'preparing' && ticket.status === 'completed') || 
                    (step === 'waiting' && ['preparing', 'completed'].includes(ticket.status)) ? '✓' : index + 1
                  )}
                </div>
                <span className="text-sm mt-2 text-center font-medium">
                  {getStatusText(step)}
                </span>
                {index < 2 && (
                  <div className={`h-1 w-full mt-4 ${
                    (step === 'waiting' && ['preparing', 'completed'].includes(ticket.status)) ||
                    (step === 'preparing' && ticket.status === 'completed') ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Mensagem especial quando pronto */}
          {ticket.status === 'completed' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h4 className="text-lg font-bold text-green-800 mb-1">Seu pedido está pronto!</h4>
                <p className="text-green-700">Dirija-se ao balcão para retirar</p>
              </div>
            </div>
          )}
          
          {/* Mensagem quando preparando */}
          {ticket.status === 'preparing' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <div className="text-2xl mb-2">👨‍🍳</div>
                <h4 className="text-lg font-bold text-blue-800 mb-1">Preparando seu pedido...</h4>
                <p className="text-blue-700">Continue suas compras, avisaremos quando estiver pronto!</p>
              </div>
            </div>
          )}
        </div>

        {/* Auto-refresh indicator */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-sm text-gray-500">
              {connected ? '🔗 Conectado - Recebendo atualizações em tempo real' : '❌ Desconectado'}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Mantenha esta página aberta enquanto faz suas compras
          </p>
        </div>

        {/* Botão para voltar */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ← Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}