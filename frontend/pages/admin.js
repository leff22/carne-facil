import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Função para resetar todas as senhas
  const resetAllTickets = async () => {
    if (!confirm('⚠️ ATENÇÃO: Isso irá deletar TODAS as senhas do sistema. Tem certeza?')) {
      return;
    }

    if (!confirm('🚨 CONFIRMAÇÃO FINAL: Esta ação não pode ser desfeita. Continuar?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:4000/admin/reset-tickets', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Todas as senhas foram resetadas com sucesso!');
        setError(null);
      } else {
        setError(data.error || 'Erro ao resetar senhas');
        setMessage(null);
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
      setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🔧 Painel Administrativo
              </h1>
              <p className="text-gray-600">
                Gestão do sistema Carne Fácil
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Voltar ao Início
            </button>
          </div>
        </div>

        {/* Mensagens */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Seção de Reset de Senhas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            🔄 Reset de Senhas
          </h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <div className="text-yellow-600 mr-3 mt-1">⚠️</div>
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Atenção!</h3>
                <p className="text-yellow-700 text-sm">
                  Esta ação irá deletar <strong>TODAS</strong> as senhas do sistema permanentemente. 
                  Use apenas quando necessário (ex: início do dia, limpeza do sistema).
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">O que será resetado:</h4>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Todas as senhas (aguardando, preparando, prontas)</li>
                <li>• Histórico de tickets</li>
                <li>• Numeração volta para #001</li>
                <li>• Tela da TV será atualizada automaticamente</li>
                <li>• Painel do açougueiro será limpo</li>
              </ul>
            </div>

            <button
              onClick={resetAllTickets}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Resetando...
                </div>
              ) : (
                '🗑️ Resetar Todas as Senhas'
              )}
            </button>
          </div>
        </div>

        {/* Links Rápidos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🔗 Links Rápidos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/butcher')}
              className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">👨‍🍳</div>
              <div className="font-semibold">Painel do Açougueiro</div>
            </button>
            
            <button
              onClick={() => router.push('/tv')}
              className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">📺</div>
              <div className="font-semibold">Tela da TV</div>
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-semibold">Página Inicial</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>Sistema Carne Fácil - Painel Administrativo</p>
          <p>Use com responsabilidade</p>
        </div>
      </div>
    </div>
  );
}