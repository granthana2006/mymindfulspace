import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const EXPENSE_CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Health", "Education", "Other"];
const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Gift", "Other"];
const COLORS = ["#f43f5e", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#6366f1"];

interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
}

const Finance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const fetchTransactions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    if (data) setTransactions(data);
  };

  useEffect(() => { fetchTransactions(); }, [user]);

  const addTransaction = async () => {
    if (!user || !amount) return;
    await supabase.from("transactions").insert({
      user_id: user.id, type, category, amount: parseFloat(amount), description: description || null, date,
    });
    setAmount(""); setDescription(""); setShowForm(false);
    fetchTransactions();
    toast({ title: "Transaction added!" });
  };

  const deleteTransaction = async (id: string) => {
    await supabase.from("transactions").delete().eq("id", id);
    fetchTransactions();
  };

  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= startOfMonth(new Date()) && d <= endOfMonth(new Date());
  });

  const totalIncome = thisMonth.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = thisMonth.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const expenseByCategory = EXPENSE_CATEGORIES.map(cat => ({
    name: cat,
    value: thisMonth.filter(t => t.type === "expense" && t.category === cat).reduce((s, t) => s + Number(t.amount), 0),
  })).filter(d => d.value > 0);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const m = subMonths(new Date(), 5 - i);
    const ms = startOfMonth(m);
    const me = endOfMonth(m);
    const monthTx = transactions.filter(t => { const d = new Date(t.date); return d >= ms && d <= me; });
    return {
      month: format(m, "MMM"),
      income: monthTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
      expense: monthTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">💰 Finance Tracker</h1>
          <p className="text-muted-foreground">Track your income & expenses</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-green-500/10 p-3"><TrendingUp className="h-6 w-6 text-green-500" /></div>
            <div><p className="text-sm text-muted-foreground">Income</p><p className="text-2xl font-bold text-foreground">₹{totalIncome.toLocaleString()}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-red-500/10 p-3"><TrendingDown className="h-6 w-6 text-red-500" /></div>
            <div><p className="text-sm text-muted-foreground">Expenses</p><p className="text-2xl font-bold text-foreground">₹{totalExpense.toLocaleString()}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-3"><Wallet className="h-6 w-6 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">Balance</p><p className={`text-2xl font-bold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>₹{balance.toLocaleString()}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Transaction</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type</Label>
                <Select value={type} onValueChange={(v) => { setType(v); setCategory(v === "income" ? "Salary" : "Food"); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Amount (₹)</Label><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" /></div>
              <div><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
            </div>
            <div><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional note" /></div>
            <Button onClick={addTransaction} className="w-full">Save Transaction</Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
              <CardContent>
                {expenseByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={expenseByCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="py-8 text-center text-muted-foreground">No expenses this month</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>6-Month Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={last6Months}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                    <Legend />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="expense" stackId="2" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardContent className="p-4">
              {transactions.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 50).map(t => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${t.type === "income" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                          {t.type === "income" ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{t.description || t.category}</p>
                          <p className="text-xs text-muted-foreground">{t.category} · {format(new Date(t.date), "dd MMM yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${t.type === "income" ? "text-green-500" : "text-red-500"}`}>
                          {t.type === "income" ? "+" : "-"}₹{Number(t.amount).toLocaleString()}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
