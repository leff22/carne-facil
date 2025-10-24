module.exports = [
"[project]/projects/carne-facil/frontend/pages/butcher.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ButcherPanel
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
;
function ButcherPanel() {
    const [tickets, setTickets] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [updating, setUpdating] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    // Buscar todos os tickets
    const fetchTickets = async ()=>{
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
        } finally{
            setLoading(false);
        }
    };
    // Atualizar status do ticket
    const updateTicketStatus = async (ticketId, newStatus)=>{
        console.log('=== ATUALIZANDO STATUS ===');
        console.log('ID:', ticketId);
        console.log('Novo status:', newStatus);
        setUpdating(ticketId);
        try {
            const response = await fetch(`http://localhost:4000/ticket/${ticketId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: newStatus
                })
            });
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            if (response.ok) {
                // Atualizar o ticket na lista local
                setTickets((prevTickets)=>prevTickets.map((ticket)=>ticket.id === ticketId ? {
                            ...ticket,
                            status: newStatus
                        } : ticket));
                setError(null);
                console.log('✅ Status atualizado com sucesso!');
            } else {
                console.error('❌ Erro na resposta:', data);
                setError(data.error || 'Erro ao atualizar status');
            }
        } catch (err) {
            console.error('❌ Erro de conexão:', err);
            setError('Erro de conexão: ' + err.message);
        } finally{
            setUpdating(null);
        }
    };
    // Carregar tickets ao montar o componente
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        fetchTickets();
        // Configurar SSE para atualizações em tempo real
        const eventSource = new EventSource('http://localhost:4000/events');
        eventSource.onmessage = (event)=>{
            const data = JSON.parse(event.data);
            if (data.type === 'ticket_updated' || data.type === 'connected' || data.type === 'tickets_reset') {
                fetchTickets(); // Recarregar todos os tickets quando houver atualização
            }
        };
        eventSource.onerror = (error)=>{
            console.error('SSE Error:', error);
        };
        // Atualizar a cada 30 segundos como fallback
        const interval = setInterval(fetchTickets, 30000);
        return ()=>{
            clearInterval(interval);
            eventSource.close();
        };
    }, []);
    // Função para obter a cor do status
    const getStatusColor = (status)=>{
        switch(status){
            case 'waiting':
                return 'bg-yellow-100 text-yellow-800';
            case 'preparing':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    // Função para obter o texto do status
    const getStatusText = (status)=>{
        switch(status){
            case 'waiting':
                return 'Aguardando';
            case 'preparing':
                return 'Preparando';
            case 'completed':
                return 'Pronto';
            default:
                return status;
        }
    };
    // Função para obter as próximas ações possíveis
    const getNextActions = (currentStatus)=>{
        switch(currentStatus){
            case 'waiting':
                return [
                    {
                        status: 'preparing',
                        label: 'Iniciar Preparo'
                    }
                ];
            case 'preparing':
                return [
                    {
                        status: 'completed',
                        label: 'Marcar como Pronto'
                    }
                ];
            case 'completed':
                return [];
            default:
                return [];
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gray-50 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                        lineNumber: 136,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "text-gray-600",
                        children: "Carregando tickets..."
                    }, void 0, false, {
                        fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                        lineNumber: 137,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                lineNumber: 135,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
            lineNumber: 134,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-50 py-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto px-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center mb-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                            className: "text-4xl font-bold text-gray-800",
                            children: "🥩 Painel do Açougueiro"
                        }, void 0, false, {
                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                            lineNumber: 147,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: fetchTickets,
                            className: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors",
                            children: "🔄 Atualizar"
                        }, void 0, false, {
                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                            lineNumber: 150,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                    lineNumber: 146,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                            children: "Erro:"
                        }, void 0, false, {
                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                            lineNumber: 160,
                            columnNumber: 13
                        }, this),
                        " ",
                        error
                    ]
                }, void 0, true, {
                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                    lineNumber: 159,
                    columnNumber: 11
                }, this),
                tickets.filter((ticket)=>ticket.status !== 'completed').length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-lg shadow-md p-8 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            className: "text-gray-500 text-lg",
                            children: "Nenhum ticket pendente"
                        }, void 0, false, {
                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                            lineNumber: 167,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            className: "text-gray-400 text-sm mt-2",
                            children: "Todos os pedidos foram finalizados ou não há pedidos no momento"
                        }, void 0, false, {
                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                            lineNumber: 168,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                    lineNumber: 166,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
                    children: tickets.filter((ticket)=>ticket.status !== 'completed') // Filtrar tickets finalizados
                    .map((ticket)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-lg shadow-md p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between items-start mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                    className: "text-2xl font-bold text-gray-800",
                                                    children: [
                                                        "Senha #",
                                                        ticket.number
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                                    lineNumber: 180,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-600",
                                                    children: ticket.customer_name || ticket.order?.customer_name || 'Cliente'
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                                    lineNumber: 183,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                            lineNumber: 179,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                            className: `px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`,
                                            children: getStatusText(ticket.status)
                                        }, void 0, false, {
                                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                            lineNumber: 185,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                    lineNumber: 178,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "space-y-2 mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-600",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                                    children: "Cliente:"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                                    lineNumber: 192,
                                                    columnNumber: 21
                                                }, this),
                                                " ",
                                                ticket.customer_name || ticket.order?.customer_name || 'N/A'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                            lineNumber: 191,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-600",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                                    children: "Loja:"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                                    lineNumber: 195,
                                                    columnNumber: 21
                                                }, this),
                                                " ",
                                                ticket.store?.name || 'N/A'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                            lineNumber: 194,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-600",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                                    children: "Criado:"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                                    lineNumber: 198,
                                                    columnNumber: 21
                                                }, this),
                                                " ",
                                                new Date(ticket.created_at).toLocaleString('pt-BR')
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                            lineNumber: 197,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                    lineNumber: 190,
                                    columnNumber: 17
                                }, this),
                                ticket.items && ticket.items.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "mb-4 p-3 bg-gray-50 rounded-lg",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                                            className: "font-semibold text-gray-700 mb-2",
                                            children: "Produtos:"
                                        }, void 0, false, {
                                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                            lineNumber: 205,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "space-y-1",
                                            children: ticket.items.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "text-sm",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            item.quantity,
                                                            "x ",
                                                            item.product_name
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                                        lineNumber: 209,
                                                        columnNumber: 27
                                                    }, this)
                                                }, index, false, {
                                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                                    lineNumber: 208,
                                                    columnNumber: 25
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                            lineNumber: 206,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                    lineNumber: 204,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: getNextActions(ticket.status).map((action)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                console.log('=== DEBUG CLICK ===');
                                                console.log('Ticket ID:', ticket.id);
                                                console.log('Status atual:', ticket.status);
                                                console.log('Novo status:', action.status);
                                                console.log('URL:', `http://localhost:4000/ticket/${ticket.id}/status`);
                                                updateTicketStatus(ticket.id, action.status);
                                            },
                                            disabled: updating === ticket.id,
                                            className: `w-full font-bold py-2 px-4 rounded-lg transition-colors ${action.status === 'completed' ? 'bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white' : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white'}`,
                                            children: updating === ticket.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                className: "flex items-center justify-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                                        lineNumber: 237,
                                                        columnNumber: 27
                                                    }, this),
                                                    "Atualizando..."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                                lineNumber: 236,
                                                columnNumber: 25
                                            }, this) : action.label
                                        }, action.status, false, {
                                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                            lineNumber: 218,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                    lineNumber: 216,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, ticket.id, true, {
                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                            lineNumber: 177,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                    lineNumber: 173,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "mt-8 grid grid-cols-1 md:grid-cols-2 gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "bg-yellow-100 rounded-lg p-4 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-semibold text-yellow-800",
                                    children: "Aguardando"
                                }, void 0, false, {
                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                    lineNumber: 254,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "text-2xl font-bold text-yellow-900",
                                    children: tickets.filter((t)=>t.status === 'waiting').length
                                }, void 0, false, {
                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                    lineNumber: 255,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                            lineNumber: 253,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "bg-blue-100 rounded-lg p-4 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-semibold text-blue-800",
                                    children: "Preparando"
                                }, void 0, false, {
                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                    lineNumber: 260,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "text-2xl font-bold text-blue-900",
                                    children: tickets.filter((t)=>t.status === 'preparing').length
                                }, void 0, false, {
                                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                                    lineNumber: 261,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                            lineNumber: 259,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
                    lineNumber: 252,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
            lineNumber: 145,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/projects/carne-facil/frontend/pages/butcher.js",
        lineNumber: 144,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__44ccfa0a._.js.map