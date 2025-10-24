module.exports = [
"[project]/projects/carne-facil/frontend/pages/tv.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Função para formatar o número do ticket
__turbopack_context__.s([
    "default",
    ()=>TVDisplay
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
const formatTicketNumber = (ticket)=>{
    // Usar o campo 'number' se existir, senão usar o ID formatado
    const displayNumber = ticket.number || ticket.id;
    return String(displayNumber).padStart(3, '0');
};
;
function TVDisplay() {
    const [tickets, setTickets] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [currentTime, setCurrentTime] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(new Date());
    // Atualizar horário a cada segundo
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const timer = setInterval(()=>{
            setCurrentTime(new Date());
        }, 1000);
        return ()=>clearInterval(timer);
    }, []);
    // Buscar tickets
    const fetchTickets = async ()=>{
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
        } finally{
            setLoading(false);
        }
    };
    // Buscar tickets inicialmente e configurar atualização automática
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        console.log('Iniciando carregamento inicial de tickets...');
        fetchTickets();
        // Atualizar a cada 5 segundos
        console.log('Configurando auto-refresh a cada 5 segundos...');
        const interval = setInterval(()=>{
            console.log('Auto-refresh executando...');
            fetchTickets();
        }, 5000);
        return ()=>{
            console.log('Limpando interval de auto-refresh');
            clearInterval(interval);
        };
    }, []);
    // Configurar SSE para atualizações em tempo real
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        console.log('Conectando ao SSE...');
        const eventSource = new EventSource('http://localhost:4000/events');
        eventSource.onopen = ()=>{
            console.log('SSE conectado com sucesso');
        };
        eventSource.onmessage = (event)=>{
            console.log('Evento SSE recebido:', event.data);
            const data = JSON.parse(event.data);
            if (data.type === 'ticket_updated' || data.type === 'connected' || data.type === 'tickets_reset') {
                console.log('Recarregando tickets devido ao evento:', data.type);
                fetchTickets(); // Recarregar todos os tickets quando houver atualização
            }
        };
        eventSource.onerror = (error)=>{
            console.error('SSE Error:', error);
            console.log('Estado da conexão SSE:', eventSource.readyState);
        };
        return ()=>{
            console.log('Fechando conexão SSE');
            eventSource.close();
        };
    }, []);
    // Filtrar tickets por status (garantir que tickets é um array)
    const ticketsArray = Array.isArray(tickets) ? tickets : [];
    console.log('Tickets no estado atual:', tickets);
    console.log('Tickets como array:', ticketsArray);
    const waitingTickets = ticketsArray.filter((t)=>t.status === 'waiting');
    const preparingTickets = ticketsArray.filter((t)=>t.status === 'preparing');
    const completedTickets = ticketsArray.filter((t)=>t.status === 'completed');
    console.log('Tickets filtrados:', {
        waiting: waitingTickets.length,
        preparing: preparingTickets.length,
        completed: completedTickets.length
    });
    // Função para formatar horário de forma segura
    const formatTime = (dateString)=>{
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gray-900 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "text-white text-2xl",
                children: "Carregando..."
            }, void 0, false, {
                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                lineNumber: 133,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
            lineNumber: 132,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-900 text-white p-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                        className: "text-5xl font-bold text-center flex-1",
                        children: "🥩 CARNE FÁCIL - PAINEL DE SENHAS"
                    }, void 0, false, {
                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "text-right",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "text-2xl font-mono",
                                children: currentTime.toLocaleTimeString('pt-BR')
                            }, void 0, false, {
                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                lineNumber: 146,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "text-lg text-gray-400",
                                children: currentTime.toLocaleDateString('pt-BR')
                            }, void 0, false, {
                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                lineNumber: 149,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                lineNumber: 141,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "bg-red-600 text-white p-4 rounded-lg mb-6 text-center",
                children: error
            }, void 0, false, {
                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                lineNumber: 156,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-3 gap-8 h-[calc(100vh-200px)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "bg-yellow-800 rounded-lg p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "text-center mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                        className: "text-3xl font-bold text-yellow-100 mb-2",
                                        children: "🕐 NA FILA"
                                    }, void 0, false, {
                                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                        lineNumber: 167,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "text-5xl font-bold text-yellow-200",
                                        children: waitingTickets.length
                                    }, void 0, false, {
                                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                        lineNumber: 170,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                lineNumber: 166,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "space-y-3 max-h-[calc(100%-120px)] overflow-y-auto",
                                children: waitingTickets.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "text-center text-yellow-200 text-xl py-8",
                                    children: "Nenhuma senha na fila"
                                }, void 0, false, {
                                    fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                    lineNumber: 177,
                                    columnNumber: 15
                                }, this) : waitingTickets.map((ticket)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "bg-yellow-700 rounded-lg p-4 text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "text-3xl font-bold text-yellow-100",
                                                children: [
                                                    "#",
                                                    formatTicketNumber(ticket)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                                lineNumber: 183,
                                                columnNumber: 19
                                            }, this),
                                            formatTime(ticket.created_at) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-yellow-200 mt-1",
                                                children: formatTime(ticket.created_at)
                                            }, void 0, false, {
                                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                                lineNumber: 187,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, ticket.id, true, {
                                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                        lineNumber: 182,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                lineNumber: 175,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                        lineNumber: 165,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "bg-blue-800 rounded-lg p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "text-center mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                        className: "text-3xl font-bold text-blue-100 mb-2",
                                        children: "👨‍🍳 EM PREPARO"
                                    }, void 0, false, {
                                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                        lineNumber: 200,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "text-5xl font-bold text-blue-200",
                                        children: preparingTickets.length
                                    }, void 0, false, {
                                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                        lineNumber: 203,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                lineNumber: 199,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "space-y-3 max-h-[calc(100%-120px)] overflow-y-auto",
                                children: preparingTickets.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "text-center text-blue-200 text-xl py-8",
                                    children: "Nenhuma senha em preparo"
                                }, void 0, false, {
                                    fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                    lineNumber: 210,
                                    columnNumber: 15
                                }, this) : preparingTickets.map((ticket)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "bg-blue-700 rounded-lg p-4 text-center animate-pulse",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "text-3xl font-bold text-blue-100",
                                                children: [
                                                    "#",
                                                    formatTicketNumber(ticket)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                                lineNumber: 216,
                                                columnNumber: 19
                                            }, this),
                                            formatTime(ticket.updated_at) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-blue-200 mt-1",
                                                children: formatTime(ticket.updated_at)
                                            }, void 0, false, {
                                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                                lineNumber: 220,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, ticket.id, true, {
                                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                        lineNumber: 215,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                lineNumber: 208,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                        lineNumber: 198,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "bg-green-800 rounded-lg p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "text-center mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                        className: "text-3xl font-bold text-green-100 mb-2",
                                        children: "✅ PRONTO PARA RETIRAR"
                                    }, void 0, false, {
                                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                        lineNumber: 233,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "text-5xl font-bold text-green-200",
                                        children: completedTickets.length
                                    }, void 0, false, {
                                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                        lineNumber: 236,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                lineNumber: 232,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "space-y-3 max-h-[calc(100%-120px)] overflow-y-auto",
                                children: completedTickets.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "text-center text-green-200 text-xl py-8",
                                    children: "Nenhuma senha pronta"
                                }, void 0, false, {
                                    fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                    lineNumber: 243,
                                    columnNumber: 15
                                }, this) : completedTickets.map((ticket)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "bg-green-700 rounded-lg p-4 text-center animate-bounce",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "text-3xl font-bold text-green-100",
                                                children: [
                                                    "#",
                                                    formatTicketNumber(ticket)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                                lineNumber: 249,
                                                columnNumber: 19
                                            }, this),
                                            formatTime(ticket.updated_at) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-green-200 mt-1",
                                                children: [
                                                    "Pronto às ",
                                                    formatTime(ticket.updated_at)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                                lineNumber: 253,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, ticket.id, true, {
                                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                        lineNumber: 248,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                                lineNumber: 241,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                        lineNumber: 231,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                lineNumber: 162,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "mt-8 text-center text-gray-400",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                    className: "text-lg",
                    children: "Acompanhe sua senha pelo QR Code • Atualização automática a cada 5 segundos"
                }, void 0, false, {
                    fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                    lineNumber: 266,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
                lineNumber: 265,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/projects/carne-facil/frontend/pages/tv.js",
        lineNumber: 139,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6900483b._.js.map