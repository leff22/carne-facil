import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Buscar produtos da API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        console.log('🔄 Iniciando busca de produtos...');
        
        const response = await fetch('http://localhost:4000/products');
        console.log('📡 Resposta da API:', response.status, response.ok);
        
        const data = await response.json();
        console.log('📦 Dados recebidos:', data);
        
        if (response.ok) {
          // A API retorna {success: true, products: [...]}
          const productsArray = data.products && Array.isArray(data.products) ? data.products : [];
          console.log('✅ Produtos processados:', productsArray.length, 'itens');
          setProducts(productsArray);
        } else {
          console.error('❌ Erro na resposta da API:', data);
          setError('Erro ao carregar produtos');
          setProducts([]); // Garantir que products seja um array vazio em caso de erro
        }
      } catch (err) {
        console.error('🚨 Erro ao conectar com o servidor:', err);
        setError('Erro ao conectar com o servidor');
        setProducts([]); // Garantir que products seja um array vazio em caso de erro
      } finally {
        setLoadingProducts(false);
        console.log('🏁 Busca de produtos finalizada');
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product_id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          product_id: product.id,
          product_name: product.name,
          unit_price: product.price,
          quantity: 1
        }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product_id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter(item => item.product_id !== productId);
      }
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  };

  const createOrder = async () => {
    if (!customerName.trim()) {
      setError('Por favor, digite seu nome');
      return;
    }

    if (cart.length === 0) {
      setError('Adicione pelo menos um produto ao carrinho');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:4000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName,
          store_id: 1, // ID da loja padrão
          items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();

      if (response.ok) {
        setOrder(data);
        
        // Buscar QR Code
        const qrResponse = await fetch(`http://localhost:4000/qrcode/${data.ticket.id}`);
        const qrData = await qrResponse.json();
        
        if (qrResponse.ok) {
          setQrCode(qrData.qrCode);
          setOrder({...data, qr_url: qrData.qr_url});
        }
      } else {
        setError(data.error || 'Erro ao criar pedido');
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400">
      {/* Header moderno */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 mb-2">
                🥩 CARNE FÁCIL
              </h1>
              <p className="text-gray-600 font-semibold text-lg">
                Carnes Premium • Qualidade Garantida • Entrega Rápida
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Formulário do Cliente */}
        {!order && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border-4 border-yellow-400">
            <div className="flex items-center mb-6">
              {/* <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 rounded-full mr-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div> */}
              <h2 className="text-3xl font-black text-gray-800">SEUS DADOS</h2>
            </div>
            <div className="mb-4">
              <label className="block text-gray-800 text-lg font-bold mb-3">
                Nome Completo:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-6 py-4 border-3 border-gray-300 rounded-xl text-lg focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-200 transition-all"
                placeholder="Digite seu nome completo"
              />
            </div>
          </div>
        )}

        {/* Lista de Produtos */}
        {!order && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border-4 border-orange-400">
            <div className="flex items-center mb-8">
              {/* <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-3 rounded-full mr-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div> */}
              <h2 className="text-3xl font-black text-gray-800">NOSSOS PRODUTOS</h2>
            </div>
            
            {loadingProducts ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-6"></div>
                <p className="text-gray-600 text-xl font-semibold">Carregando produtos deliciosos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-xl">Nenhum produto disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-3 border-yellow-300 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-red-400">
                    <div className="text-center mb-4">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-4 h-4 object-cover rounded-lg mx-auto mb-2 border-2 border-orange-300"
                          style={{maxWidth: '16px', maxHeight: '16px'}}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div className="text-xs mb-2" style={{display: product.image_url ? 'none' : 'block', fontSize: '12px'}}>
                        {product.image_placeholder || '🥩'}
                      </div>
                      <h3 className="font-black text-xl text-gray-800 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm font-medium">{product.description}</p>
                    </div>
                  
                    <div className="text-center mb-4">
                      <div className="text-3xl font-black text-red-600 mb-1">
                        R$ {product.price.toFixed(2)}
                      </div>
                      <div className="text-gray-600 text-sm font-semibold bg-yellow-200 px-3 py-1 rounded-full inline-block">
                        por {product.unit}
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-black text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      + ADICIONAR AO CARRINHO
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Carrinho */}
        {!order && cart.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border-4 border-red-400">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                {/* <div className="bg-gradient-to-r from-red-500 to-yellow-500 text-white p-3 rounded-full mr-4">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                </div> */}
                <h2 className="text-3xl font-black text-gray-800">SEU CARRINHO</h2>
              </div>
              <button
                onClick={() => setShowCart(!showCart)}
                className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
              >
                {showCart ? 'OCULTAR' : 'MOSTRAR'} ({cart.length} {cart.length === 1 ? 'item' : 'itens'})
              </button>
            </div>

            {showCart && (
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.product_id} className="flex justify-between items-center bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-300">
                    <div>
                      <div className="font-black text-lg text-gray-800">{item.product_name}</div>
                      <div className="text-gray-600 font-semibold">R$ {item.unit_price.toFixed(2)} x {item.quantity}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 transform hover:scale-110"
                      >
                        -
                      </button>
                      <span className="font-black text-xl bg-white px-4 py-2 rounded-lg border-2 border-gray-300">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(products.find(p => p.id === item.product_id))}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 transform hover:scale-110"
                      >
                        +
                      </button>
                      <div className="ml-4 font-black text-xl text-red-600 bg-yellow-200 px-4 py-2 rounded-lg">
                        R$ {(item.unit_price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t-4 border-yellow-400 pt-6">
              <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-red-100 to-yellow-100 p-6 rounded-2xl border-3 border-red-300">
                <span className="text-2xl font-black text-gray-800">TOTAL:</span>
                <span className="text-4xl font-black text-red-600">
                  R$ {getCartTotal().toFixed(2)}
                </span>
              </div>

              <button
                onClick={createOrder}
                disabled={loading || !customerName.trim()}
                className={`w-full py-6 px-8 rounded-2xl font-black text-xl text-white transition-all duration-300 transform hover:scale-105 ${
                  loading || !customerName.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 shadow-2xl hover:shadow-3xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mr-3"></div>
                    CRIANDO PEDIDO...
                  </div>
                ) : (
                  '🎯 FAZER PEDIDO E GERAR QR CODE'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-gradient-to-r from-red-100 to-red-200 border-4 border-red-400 text-red-800 px-6 py-4 rounded-2xl mb-8 shadow-lg">
            <div className="flex items-center">
              <div className="bg-red-500 text-white p-2 rounded-full mr-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <strong className="font-black text-lg">ERRO:</strong>
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resultado do pedido */}
        {order && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-400">
            <div className="text-center mb-8">
              {/* <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full inline-block mb-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div> */}
              <h3 className="text-4xl font-black text-green-600 mb-2">
                PEDIDO CRIADO COM SUCESSO!
              </h3>
              <p className="text-xl font-semibold text-gray-600">
                Seu QR Code está pronto para usar
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-2xl font-black mb-4 text-gray-800">INFORMAÇÕES DO PEDIDO:</h4>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border-3 border-yellow-300">
                  <div className="space-y-3">
                    <p className="flex justify-between"><strong>Loja:</strong> <span className="font-semibold">{order.ticket?.store_name}</span></p>
                    <p className="flex justify-between"><strong>Cliente:</strong> <span className="font-semibold">{order.ticket?.customer_name}</span></p>
                    <p className="flex justify-between"><strong>Senha:</strong> <span className="bg-red-500 text-white px-3 py-1 rounded-full font-black">#{order.ticket?.number}</span></p>
                    <p className="flex justify-between"><strong>ID:</strong> <span className="font-mono text-sm">{order.ticket?.id}</span></p>
                    <p className="flex justify-between"><strong>Status:</strong> <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold">Aguardando</span></p>
                  </div>
                </div>
                
                {/* QR Code permanente */}
                <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-3 border-green-300">
                  <div className="flex items-center mb-4">
                    <div className="w-4 h-4 bg-green-600 rounded-full mr-3"></div>
                    <p className="font-black text-green-800 text-lg">
                      QR CODE GERADO COM SUCESSO!
                    </p>
                  </div>
                  <p className="text-green-700 font-semibold mb-3">
                    📱 <strong>Escaneie o QR Code</strong> para acessar sua página da senha
                  </p>
                  <p className="text-green-600 font-medium mb-3">
                    O QR Code te levará diretamente para o acompanhamento em tempo real
                  </p>
                  <p className="text-blue-700 font-semibold">
                    💡 <strong>Dica:</strong> Se o QR Code não abrir automaticamente, copie o link abaixo
                  </p>
                </div>

                {/* Link manual caso precise */}
                <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-3 border-blue-300">
                  <p className="font-black text-blue-800 mb-3 text-lg">🔗 OU ACESSE DIRETAMENTE:</p>
                  <a 
                    href={order.qr_url} 
                    className="text-blue-600 hover:text-blue-800 underline break-all font-semibold"
                  >
                    {order.qr_url}
                  </a>
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="text-2xl font-black mb-6 text-gray-800">SEU QR CODE:</h4>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-3 border-gray-300">
                  {qrCode && (
                    <img 
                      src={qrCode} 
                      alt="QR Code da Senha" 
                      className="mx-auto border-4 border-gray-400 rounded-xl shadow-lg"
                    />
                  )}
                  <p className="text-gray-700 font-semibold mt-4 text-lg">
                    Escaneie para acessar a página da senha
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Instruções */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-blue-300 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex items-center mb-6">
            {/* <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full mr-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div> */}
            <h3 className="text-3xl font-black text-blue-800">COMO FUNCIONA:</h3>
          </div>
          <ol className="list-decimal list-inside space-y-4 text-blue-800">
            <li className="text-lg font-semibold"><strong>Criar Pedido:</strong> Clique no botão para gerar sua senha e QR Code</li>
            <li className="text-lg font-semibold"><strong>Escanear QR Code:</strong> Use seu celular para escanear o código</li>
            <li className="text-lg font-semibold"><strong>Acompanhar:</strong> O QR Code te leva para a página da sua senha</li>
            <li className="text-lg font-semibold"><strong>Fazer Compras:</strong> Mantenha a página aberta enquanto faz suas compras</li>
            <li className="text-lg font-semibold"><strong>Receber Notificação:</strong> A página atualiza quando o açougueiro muda o status</li>
          </ol>
          
          <div className="mt-6 p-6 bg-gradient-to-r from-yellow-100 to-yellow-200 border-3 border-yellow-400 rounded-2xl">
            <p className="text-yellow-900 font-semibold text-lg">
              💡 <strong>Dica:</strong> O QR Code fica disponível até você escaneá-lo. Depois disso, use a página da senha no seu celular!
            </p>
          </div>
        </div>

        {/* Links do Sistema */}
        <div className="bg-white border-4 border-gray-300 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center mb-8">
            {/* <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-3 rounded-full mr-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
            </div> */}
            <h3 className="text-3xl font-black text-gray-800">ACESSO AO SISTEMA:</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => router.push('/butcher')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="text-4xl mb-3">👨‍🍳</div>
              <div className="font-black text-lg">PAINEL DO AÇOUGUEIRO</div>
            </button>
            
            <button
              onClick={() => router.push('/tv')}
              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="text-4xl mb-3">📺</div>
              <div className="font-black text-lg">TELA DA TV</div>
            </button>
            
            <button
              onClick={() => router.push('/admin')}
              className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-6 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="text-4xl mb-3">🔧</div>
              <div className="font-black text-lg">PAINEL ADMIN</div>
            </button>
            
            <div className="bg-gradient-to-br from-gray-200 to-gray-300 p-6 rounded-2xl text-center border-3 border-gray-400">
              <div className="text-4xl mb-3 text-gray-500">📱</div>
              <div className="font-black text-lg text-gray-600">CLIENTE (QR CODE)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}