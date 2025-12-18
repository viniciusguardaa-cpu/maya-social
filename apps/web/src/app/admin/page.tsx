"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
    Users,
    DollarSign,
    TrendingUp,
    CreditCard,
    Search,
    MoreHorizontal,
    Mail,
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
    ArrowUpRight,
    Download,
    Filter,
    Building2,
    Globe
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { getRegisteredUsers, RegisteredUser } from "@/lib/admin-utils"

interface Customer {
    id: string
    name: string
    email: string
    company: string
    plan: "starter" | "pro" | "enterprise"
    status: "active" | "trial" | "cancelled" | "past_due"
    mrr: number
    users: number
    brands: number
    country: string
    createdAt: string
    trialEndsAt?: string
}

const planConfig = {
    starter: { label: "Starter", price: 49, color: "bg-slate-500" },
    pro: { label: "Pro", price: 149, color: "bg-blue-500" },
    enterprise: { label: "Enterprise", price: 399, color: "bg-purple-500" },
}

const statusConfig = {
    active: { label: "Ativo", color: "bg-green-500", icon: CheckCircle },
    trial: { label: "Trial", color: "bg-amber-500", icon: Calendar },
    past_due: { label: "Pagamento Pendente", color: "bg-red-500", icon: AlertCircle },
    cancelled: { label: "Cancelado", color: "bg-gray-500", icon: XCircle },
}

export default function AdminPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<string>("all")

    // Load registered users from localStorage on mount
    useEffect(() => {
        const registeredUsers = getRegisteredUsers()
        setCustomers(registeredUsers)
    }, [])

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.company.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === "all" || c.status === filterStatus
        return matchesSearch && matchesStatus
    })

    // Métricas
    const totalMRR = customers.filter(c => c.status === "active").reduce((acc, c) => acc + c.mrr, 0)
    const activeCustomers = customers.filter(c => c.status === "active").length
    const trialCustomers = customers.filter(c => c.status === "trial").length
    const churnedCustomers = customers.filter(c => c.status === "cancelled").length
    const avgRevenue = activeCustomers > 0 ? totalMRR / activeCustomers : 0

    const sendEmail = (customer: Customer) => {
        toast.success(`Email enviado para ${customer.email}`)
    }

    const extendTrial = (customer: Customer) => {
        toast.success(`Trial de ${customer.name} estendido por 7 dias`)
    }

    const cancelSubscription = (customer: Customer) => {
        setCustomers(customers.map(c =>
            c.id === customer.id ? { ...c, status: "cancelled" as const, mrr: 0 } : c
        ))
        toast.success(`Assinatura de ${customer.company} cancelada`)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Building2 className="h-6 w-6" />
                                Painel Admin
                            </h1>
                            <p className="text-muted-foreground">Gerencie seus clientes e assinaturas</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                            </Button>
                            <Button>
                                <Users className="h-4 w-4 mr-2" />
                                Convidar Cliente
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                {/* Métricas */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">MRR Total</p>
                                    <p className="text-3xl font-bold">R$ {totalMRR.toLocaleString()}</p>
                                    <p className="text-xs text-green-500 flex items-center mt-1">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        +12% vs mês anterior
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                                    <p className="text-3xl font-bold">{activeCustomers}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        +{trialCustomers} em trial
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Ticket Médio</p>
                                    <p className="text-3xl font-bold">R$ {avgRevenue.toFixed(0)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        por cliente/mês
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <CreditCard className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Churn Rate</p>
                                    <p className="text-3xl font-bold">{((churnedCustomers / customers.length) * 100).toFixed(1)}%</p>
                                    <p className="text-xs text-red-500 mt-1">
                                        {churnedCustomers} cancelamentos
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* MRR por Plano */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Distribuição por Plano</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(["starter", "pro", "enterprise"] as const).map((plan) => {
                                const count = customers.filter(c => c.plan === plan && c.status === "active").length
                                const planMRR = customers.filter(c => c.plan === plan && c.status === "active").reduce((a, c) => a + c.mrr, 0)
                                const percentage = totalMRR > 0 ? (planMRR / totalMRR) * 100 : 0

                                return (
                                    <div key={plan} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${planConfig[plan].color}`} />
                                                <span>{planConfig[plan].label}</span>
                                                <span className="text-muted-foreground">({count} clientes)</span>
                                            </div>
                                            <span className="font-medium">R$ {planMRR}/mês</span>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome, email ou empresa..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-2">
                        {["all", "active", "trial", "past_due", "cancelled"].map((status) => (
                            <Button
                                key={status}
                                variant={filterStatus === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterStatus(status)}
                            >
                                {status === "all" ? "Todos" : statusConfig[status as keyof typeof statusConfig]?.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Lista de Clientes */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="text-left p-4 font-medium">Cliente</th>
                                        <th className="text-left p-4 font-medium">Plano</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">MRR</th>
                                        <th className="text-left p-4 font-medium">Uso</th>
                                        <th className="text-left p-4 font-medium">País</th>
                                        <th className="text-left p-4 font-medium">Desde</th>
                                        <th className="text-right p-4 font-medium">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredCustomers.map((customer) => {
                                        const StatusIcon = statusConfig[customer.status].icon
                                        return (
                                            <tr key={customer.id} className="hover:bg-muted/50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="text-xs">
                                                                {customer.name.split(" ").map(n => n[0]).join("")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{customer.name}</p>
                                                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={`${planConfig[customer.plan].color} text-white`}>
                                                        {planConfig[customer.plan].label}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <StatusIcon className={`h-4 w-4 ${customer.status === "active" ? "text-green-500" :
                                                            customer.status === "trial" ? "text-amber-500" :
                                                                customer.status === "past_due" ? "text-red-500" :
                                                                    "text-gray-500"
                                                            }`} />
                                                        <span className="text-sm">{statusConfig[customer.status].label}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-medium">
                                                        {customer.mrr > 0 ? `R$ ${customer.mrr}` : "-"}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm">
                                                        <span>{customer.users} usuários</span>
                                                        <span className="text-muted-foreground"> • </span>
                                                        <span>{customer.brands} marcas</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <Globe className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">{customer.country}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {new Date(customer.createdAt).toLocaleDateString("pt-BR")}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => sendEmail(customer)}>
                                                                <Mail className="h-4 w-4 mr-2" />
                                                                Enviar Email
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <ArrowUpRight className="h-4 w-4 mr-2" />
                                                                Ver Dashboard
                                                            </DropdownMenuItem>
                                                            {customer.status === "trial" && (
                                                                <DropdownMenuItem onClick={() => extendTrial(customer)}>
                                                                    <Calendar className="h-4 w-4 mr-2" />
                                                                    Estender Trial
                                                                </DropdownMenuItem>
                                                            )}
                                                            {customer.status !== "cancelled" && (
                                                                <DropdownMenuItem
                                                                    onClick={() => cancelSubscription(customer)}
                                                                    className="text-destructive"
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-2" />
                                                                    Cancelar Assinatura
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
