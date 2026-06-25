import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Heart, Plus, IndianRupee, CreditCard, Banknote, Gift, Edit, Trash2, CheckCircle, Clock, Search, Printer, X, Award, ShieldCheck, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Devotee } from "@shared/schema";

interface Donation {
  id: number;
  devoteeId: number;
  amount: string;
  currency: string;
  donationType: string;
  purpose: string | null;
  donationDate: string;
  paymentMethod: string | null;
  transactionId: string | null;
  receiptNumber: string | null;
  taxDeductible: boolean;
  anonymousDonation: boolean;
  notes: string | null;
  recordedBy: string | null;
  status: string;
  createdAt: string;
}

const getTypeBadge = (type: string) => {
  const styles: Record<string, string> = {
    cash: "bg-green-100 text-green-800 border-green-200",
    online: "bg-blue-100 text-blue-800 border-blue-200",
    cheque: "bg-purple-100 text-purple-800 border-purple-200",
    kind: "bg-orange-100 text-orange-800 border-orange-200",
    upi: "bg-cyan-100 text-cyan-800 border-cyan-200",
  };
  return <Badge className={styles[type] || "bg-gray-100 text-gray-800"}>{type}</Badge>;
};

export default function Donations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editDonation, setEditDonation] = useState<Donation | null>(null);
  const [receiptDonation, setReceiptDonation] = useState<Donation | null>(null);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [selectedTaxDevoteeId, setSelectedTaxDevoteeId] = useState("");
  const [selectedTaxYear, setSelectedTaxYear] = useState(new Date().getFullYear().toString());
  const [formData, setFormData] = useState({
    devoteeId: "", amount: "", currency: "INR", donationType: "cash", purpose: "",
    donationDate: new Date().toISOString().slice(0, 10), paymentMethod: "cash",
    transactionId: "", receiptNumber: "", taxDeductible: false, anonymousDonation: false,
    notes: "", status: "received"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: donations = [], isLoading } = useQuery<Donation[]>({ queryKey: ["/api/donations"] });
  const { data: devotees = [] } = useQuery<Devotee[]>({ queryKey: ["/api/devotees"] });

  const getDevoteeName = (id: number) => {
    const d = devotees.find((dv: Devotee) => dv.id === id);
    return d ? `${d.firstName} ${d.lastName}` : `Devotee #${id}`;
  };

  const getDevoteeInitials = (id: number) => {
    const d = devotees.find((dv: Devotee) => dv.id === id);
    return d ? `${d.firstName[0]}${d.lastName[0]}` : "?";
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/donations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      toast({ title: "Success", description: "Donation recorded successfully" });
      setIsFormOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to record donation", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/donations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      toast({ title: "Success", description: "Donation updated" });
      setIsFormOpen(false);
      setEditDonation(null);
    },
    onError: () => toast({ title: "Error", description: "Failed to update donation", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/donations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      toast({ title: "Success", description: "Donation record deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
  });

  const filteredDonations = donations.filter((d: Donation) => {
    const donorName = d.anonymousDonation ? "anonymous" : getDevoteeName(d.devoteeId).toLowerCase();
    const matchesSearch = !searchTerm || donorName.includes(searchTerm.toLowerCase()) ||
      (d.purpose || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.transactionId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.receiptNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || d.donationType === selectedType;
    const matchesPayment = selectedPayment === "all" || d.paymentMethod === selectedPayment;
    const matchesStatus = selectedStatus === "all" || d.status === selectedStatus;
    return matchesSearch && matchesType && matchesPayment && matchesStatus;
  });

  const totalDonations = donations.reduce((s: number, d: Donation) => s + parseFloat(d.amount || "0"), 0);
  const monthlyDonations = donations.filter((d: Donation) => {
    const date = new Date(d.donationDate); const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).reduce((s: number, d: Donation) => s + parseFloat(d.amount || "0"), 0);
  const pendingCount = donations.filter((d: Donation) => d.status === "pending").length;

  const openAdd = () => {
    setEditDonation(null);
    setFormData({ devoteeId: "", amount: "", currency: "INR", donationType: "cash", purpose: "", donationDate: new Date().toISOString().slice(0, 10), paymentMethod: "cash", transactionId: "", receiptNumber: "", taxDeductible: false, anonymousDonation: false, notes: "", status: "received" });
    setIsFormOpen(true);
  };

  const openEdit = (d: Donation) => {
    setEditDonation(d);
    setFormData({
      devoteeId: String(d.devoteeId),
      amount: d.amount,
      currency: d.currency,
      donationType: d.donationType,
      purpose: d.purpose || "",
      donationDate: d.donationDate ? new Date(d.donationDate).toISOString().slice(0, 10) : "",
      paymentMethod: d.paymentMethod || "cash",
      transactionId: d.transactionId || "",
      receiptNumber: d.receiptNumber || "",
      taxDeductible: d.taxDeductible,
      anonymousDonation: d.anonymousDonation,
      notes: d.notes || "",
      status: d.status,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      devoteeId: parseInt(formData.devoteeId),
      donationDate: new Date(formData.donationDate).toISOString(),
    };
    if (editDonation) updateMutation.mutate({ id: editDonation.id, data });
    else createMutation.mutate(data);
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" text="Loading donations..." /></div>;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Donations" subtitle="Track and manage all donations and offerings" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-3"><div className="flex items-center gap-3"><IndianRupee className="w-8 h-8 text-green-600" /><div><p className="text-2xl font-bold">₹{totalDonations.toLocaleString('en-IN')}</p><p className="text-xs text-muted-foreground">Total Received</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3"><div className="flex items-center gap-3"><Heart className="w-8 h-8 text-red-500" /><div><p className="text-2xl font-bold">₹{monthlyDonations.toLocaleString('en-IN')}</p><p className="text-xs text-muted-foreground">This Month</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3"><div className="flex items-center gap-3"><Gift className="w-8 h-8 text-blue-500" /><div><p className="text-2xl font-bold">{donations.length}</p><p className="text-xs text-muted-foreground">Total Records</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-yellow-500" /><div><p className="text-2xl font-bold">{pendingCount}</p><p className="text-xs text-muted-foreground">Pending</p></div></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5 text-primary" /> Donation Records ({filteredDonations.length})</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search donor, purpose..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 w-52"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="kind">In Kind</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                 <Button onClick={() => setIsTaxModalOpen(true)} variant="outline" className="border-primary/30 hover:bg-primary/5 text-primary">
                  <Award className="w-4 h-4 mr-2" /> Annual Tax Certificate
                </Button>
                <Button onClick={openAdd} className="bg-gradient-to-r from-primary to-secondary">
                  <Plus className="w-4 h-4 mr-2" /> Record Donation
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDonations.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No donations found</h3>
                <p className="text-muted-foreground mb-4">No records match your current filters.</p>
                <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Record First Donation</Button>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonations.map((d: Donation) => (
                      <TableRow key={d.id} className="hover:bg-muted/30">
                        <TableCell>
                          {d.anonymousDonation ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Gift className="w-4 h-4 text-muted-foreground" /></div>
                              <span className="text-sm text-muted-foreground italic">Anonymous</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/devotees/${d.devoteeId}`)}>
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold text-primary">{getDevoteeInitials(d.devoteeId)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm hover:text-primary transition-colors">{getDevoteeName(d.devoteeId)}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-semibold text-green-700 dark:text-green-400">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {parseFloat(d.amount).toLocaleString('en-IN')}
                            {d.taxDeductible && <span title="Tax Deductible"><CheckCircle className="w-3.5 h-3.5 text-blue-500 ml-1" /></span>}
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(d.donationType)}</TableCell>
                        <TableCell><span className="text-sm max-w-[120px] break-words block" title={d.purpose || "General"}>{d.purpose || "General"}</span></TableCell>
                        <TableCell>
                          <span className="text-sm whitespace-nowrap">{new Date(d.donationDate).toLocaleDateString('en-IN')}</span>
                        </TableCell>
                        <TableCell>
                          {d.receiptNumber ? (
                            <Badge variant="outline" className="font-mono text-xs">#{d.receiptNumber}</Badge>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={d.status === "received" ? "default" : d.status === "pending" ? "secondary" : "outline"} className="capitalize">{d.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(d)} title="Edit"><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => setReceiptDonation(d)} title="Print Receipt" className="text-blue-600 hover:text-blue-700">
                              <Printer className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Donation Record</AlertDialogTitle>
                                  <AlertDialogDescription>Delete donation of ₹{parseFloat(d.amount).toLocaleString('en-IN')} from {d.anonymousDonation ? "Anonymous" : getDevoteeName(d.devoteeId)}? This cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMutation.mutate(d.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
          </div>

          <div className="lg:col-span-1">
            {/* Top Donors */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Top Donors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">No donation records yet</div>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const donorSums: Record<number, { amount: number; lastType: string; isAnonymous: boolean }> = {};
                      donations.forEach((d: Donation) => {
                        const amountVal = parseFloat(d.amount || "0");
                        if (!d.devoteeId) return;
                        if (!donorSums[d.devoteeId]) {
                          donorSums[d.devoteeId] = { amount: 0, lastType: d.donationType, isAnonymous: d.anonymousDonation };
                        }
                        donorSums[d.devoteeId].amount += amountVal;
                      });

                      return Object.entries(donorSums)
                        .map(([devoteeId, data]) => ({
                          devoteeId: parseInt(devoteeId),
                          amount: data.amount,
                          donationType: data.lastType,
                          anonymousDonation: data.isAnonymous
                        }))
                        .sort((a, b) => b.amount - a.amount)
                        .slice(0, 5)
                        .map((d: any) => {
                          const dev = devotees.find((dv: Devotee) => dv.id === d.devoteeId);
                          const devName = d.anonymousDonation || !dev ? "Anonymous" : `${dev.firstName} ${dev.lastName}`;
                          const initials = d.anonymousDonation || !dev ? "?" : `${dev.firstName[0]}${dev.lastName[0]}`;
                          return (
                            <div
                              key={d.devoteeId}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs bg-green-100 text-green-700 font-semibold">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{devName}</div>
                                <div className="text-xs text-muted-foreground capitalize">{d.donationType}</div>
                              </div>
                              <div className="text-sm font-bold text-green-700 dark:text-green-400">₹{d.amount.toLocaleString("en-IN")}</div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* ── RECEIPT MODAL ─────────────────────────────────────────────── */}
      {receiptDonation && (
        <Dialog open onOpenChange={() => setReceiptDonation(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-primary" /> Donation Receipt
                </DialogTitle>
              </div>
            </DialogHeader>
            <div id="receipt-print-area" className="border border-border rounded-lg overflow-hidden">
              {/* Receipt header */}
              <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white text-center">
                <div className="text-xl font-bold">Madhav Parivar</div>
                <div className="text-sm opacity-90">Devotional Community Organization</div>
                <div className="text-xs opacity-75 mt-1">Donation Receipt</div>
              </div>

              <div className="p-5 space-y-4">
                {/* Receipt number + date */}
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Receipt No.</div>
                    <div className="font-mono font-bold">{receiptDonation.receiptNumber ? `#${receiptDonation.receiptNumber}` : `#RCP-${receiptDonation.id.toString().padStart(5, "0")}`}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Date</div>
                    <div className="font-medium">{new Date(receiptDonation.donationDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
                  </div>
                </div>

                <div className="border-t border-dashed border-border" />

                {/* Donor */}
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Received From</div>
                  <div className="font-semibold text-lg">
                    {receiptDonation.anonymousDonation ? "Anonymous Donor" : getDevoteeName(receiptDonation.devoteeId)}
                  </div>
                </div>

                {/* Amount — large display */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                  <div className="text-xs text-green-700 dark:text-green-300 mb-1">Amount Received</div>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                    ₹{parseFloat(receiptDonation.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1 capitalize">
                    {receiptDonation.currency} · {receiptDonation.paymentMethod || receiptDonation.donationType}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Purpose</div>
                    <div className="font-medium">{receiptDonation.purpose || "General Donation"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Donation Type</div>
                    <div className="font-medium capitalize">{receiptDonation.donationType}</div>
                  </div>
                  {receiptDonation.transactionId && (
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground">Transaction ID</div>
                      <div className="font-mono text-xs">{receiptDonation.transactionId}</div>
                    </div>
                  )}
                  {receiptDonation.taxDeductible && (
                    <div className="col-span-2 flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-700 dark:text-blue-300">Tax Deductible under Section 80G</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-border" />
                <div className="text-center text-xs text-muted-foreground">
                  This receipt is computer-generated and is valid without a signature.
                  <br />Thank you for your generous contribution. Jai Swaminarayan 🙏
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setReceiptDonation(null)}>Close</Button>
              <Button
                onClick={() => {
                  const area = document.getElementById("receipt-print-area");
                  if (!area) return;
                  const win = window.open("", "_blank", "width=600,height=700");
                  if (!win) return;
                  win.document.write(`<html><head><title>Receipt</title><style>body{font-family:sans-serif;padding:20px;}</style></head><body>${area.innerHTML}</body></html>`);
                  win.document.close();
                  win.print();
                }}
                className="bg-primary text-primary-foreground"
              >
                <Printer className="w-4 h-4 mr-2" /> Print Receipt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── ANNUAL TAX CERTIFICATE MODAL ────────────────────── */}
      <Dialog open={isTaxModalOpen} onOpenChange={setIsTaxModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Generate Annual Tax Certificate
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 print:p-0">
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border/40">
              <div className="space-y-1.5">
                <Label>Select Devotee</Label>
                <Select value={selectedTaxDevoteeId} onValueChange={setSelectedTaxDevoteeId}>
                  <SelectTrigger><SelectValue placeholder="Choose devotee..." /></SelectTrigger>
                  <SelectContent>
                    {devotees.map((dv: Devotee) => (
                      <SelectItem key={dv.id} value={String(dv.id)}>{dv.firstName} {dv.lastName} ({dv.devoteeId})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Financial Year</Label>
                <Select value={selectedTaxYear} onValueChange={setSelectedTaxYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026 - 2027</SelectItem>
                    <SelectItem value="2025">2025 - 2026</SelectItem>
                    <SelectItem value="2024">2024 - 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedTaxDevoteeId && (
              (() => {
                const devoteeIdNum = parseInt(selectedTaxDevoteeId);
                const devotee = devotees.find(d => d.id === devoteeIdNum);
                if (!devotee) return null;

                const startYear = parseInt(selectedTaxYear);
                const startDate = new Date(startYear, 3, 1); // April 1st
                const endDate = new Date(startYear + 1, 2, 31, 23, 59, 59); // March 31st

                const devoteeDonations = donations.filter(d => 
                  d.devoteeId === devoteeIdNum &&
                  d.status === "received" &&
                  new Date(d.donationDate) >= startDate &&
                  new Date(d.donationDate) <= endDate
                );

                const totalAmount = devoteeDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);

                return (
                  <div className="space-y-4">
                    {/* Print Preview Container */}
                    <div id="tax-print-area" className="border border-border p-6 rounded-lg bg-card text-foreground font-sans relative">
                      <div className="absolute inset-2 border border-amber-500/10 pointer-events-none rounded"></div>
                      
                      {/* Receipt Header */}
                      <div className="flex justify-between items-start gap-4 pb-4 border-b border-border/80">
                        <div className="space-y-1 text-left">
                          <h2 className="text-xl font-bold text-amber-700 dark:text-amber-500">Madhav Parivar</h2>
                          <p className="text-xs text-muted-foreground">Devotional Community & Charitable Trust</p>
                          <p className="text-[10px] text-muted-foreground">Reg No: MP-CT-2026-9874 | Sector-6, Dwarka, New Delhi</p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant="outline" className="border-amber-600/30 text-amber-700 font-bold bg-amber-500/5">TAX EXEMPT RECEIPT</Badge>
                          <p className="text-xs text-muted-foreground">FY: {selectedTaxYear} - {parseInt(selectedTaxYear) + 1}</p>
                          <p className="text-[10px] text-muted-foreground">Generated: {new Date().toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>

                      {/* Main Title */}
                      <div className="py-6 text-center">
                        <h3 className="text-md font-bold tracking-wider text-foreground uppercase">Annual Donation Certificate</h3>
                        <p className="text-xs text-muted-foreground mt-1">Issued under Section 80G of the Income Tax Act</p>
                      </div>

                      {/* Devotee Info Summary */}
                      <div className="grid grid-cols-2 gap-4 text-xs pb-4 border-b border-dashed border-border">
                        <div>
                          <p className="text-muted-foreground text-[10px] uppercase font-semibold">Devotee Details</p>
                          <p className="font-bold text-sm mt-0.5">{devotee.firstName} {devotee.lastName}</p>
                          <p className="text-muted-foreground mt-0.5">ID: {devotee.devoteeId}</p>
                          <p className="text-muted-foreground mt-0.5">{devotee.address || "No Address Added"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground text-[10px] uppercase font-semibold">Financial Summary</p>
                          <p className="text-xl font-black text-green-700 dark:text-green-400 mt-1">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                          <p className="text-muted-foreground mt-0.5 text-[10px]">Total Tax-Deductible Contributions</p>
                        </div>
                      </div>

                      {/* Donations list */}
                      <div className="py-4">
                        <p className="text-muted-foreground text-[10px] uppercase font-semibold mb-2">Contribution Breakdown</p>
                        {devoteeDonations.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic text-center py-4">No approved donations recorded in this financial year.</p>
                        ) : (
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="border-b border-border/80 text-muted-foreground">
                                <th className="py-1.5 font-bold">Date</th>
                                <th className="py-1.5 font-bold">Receipt No.</th>
                                <th className="py-1.5 font-bold">Method</th>
                                <th className="py-1.5 font-bold">Purpose</th>
                                <th className="py-1.5 font-bold text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                              {devoteeDonations.map(d => (
                                <tr key={d.id} className="text-muted-foreground">
                                  <td className="py-1.5">{new Date(d.donationDate).toLocaleDateString('en-IN')}</td>
                                  <td className="py-1.5 font-mono">#{d.receiptNumber || `RCP-${d.id}`}</td>
                                  <td className="py-1.5 capitalize">{d.paymentMethod || d.donationType}</td>
                                  <td className="py-1.5">{d.purpose || "General Offering"}</td>
                                  <td className="py-1.5 text-right font-bold text-foreground">₹{parseFloat(d.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* Footer signatures and verification */}
                      <div className="pt-6 border-t border-border flex justify-between items-end gap-6 text-xs mt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-muted border border-border flex flex-col items-center justify-center rounded p-1 text-center shrink-0">
                            <span className="text-[7px] text-muted-foreground">VERIFIED</span>
                            <div className="w-8 h-8 border border-dashed border-primary/40 rounded flex items-center justify-center mt-0.5">
                              <ShieldCheck className="w-5 h-5 text-amber-600" />
                            </div>
                          </div>
                          <div className="space-y-1 text-muted-foreground">
                            <p className="text-[9px] font-semibold text-foreground">Declaration</p>
                            <p className="text-[8px] max-w-sm leading-tight">This certificate certifies that the above donations were received towards the charitable goals of Madhav Parivar. All contributions are eligible for exemption under local tax guidelines.</p>
                          </div>
                        </div>
                        <div className="text-center w-36 space-y-1">
                          <div className="h-8 border-b border-border/80 relative">
                            <span className="absolute bottom-1 right-8 font-serif text-[10px] italic text-amber-700">Madhav P.</span>
                          </div>
                          <p className="text-[9px] text-muted-foreground">Authorized Signatory</p>
                          <p className="text-[8px] text-muted-foreground">Treasurer, Madhav Parivar</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setIsTaxModalOpen(false)}>Close</Button>
                      <Button
                        disabled={devoteeDonations.length === 0}
                        onClick={() => {
                          const area = document.getElementById("tax-print-area");
                          if (!area) return;
                          const win = window.open("", "_blank", "width=800,height=850");
                          if (!win) return;
                          win.document.write(`<html><head><title>Annual Tax Certificate - ${devotee.firstName} ${devotee.lastName}</title><style>body{font-family:sans-serif;padding:30px;}table{width:100%;border-collapse:collapse;}th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left;}th{background:#f9f9f9;}</style></head><body>${area.innerHTML}</body></html>`);
                          win.document.close();
                          win.print();
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-md shadow-amber-500/10"
                      >
                        <Printer className="w-4 h-4 mr-2" /> Print Annual Certificate
                      </Button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editDonation ? "Edit Donation" : "Record New Donation"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Switch checked={formData.anonymousDonation} onCheckedChange={v => setFormData({...formData, anonymousDonation: v})} />
              <Label className="cursor-pointer">Anonymous Donation</Label>
            </div>
            {!formData.anonymousDonation && (
              <div className="space-y-1.5">
                <Label>Devotee *</Label>
                <Select value={formData.devoteeId} onValueChange={v => setFormData({...formData, devoteeId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select donor" /></SelectTrigger>
                  <SelectContent>
                    {devotees.map((dv: Devotee) => (
                      <SelectItem key={dv.id} value={String(dv.id)}>{dv.firstName} {dv.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Amount (₹) *</Label>
                <Input required type="number" min="1" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="1000" />
              </div>
              <div className="space-y-1.5">
                <Label>Date *</Label>
                <Input required type="date" value={formData.donationDate} onChange={e => setFormData({...formData, donationDate: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Donation Type</Label>
                <Select value={formData.donationType} onValueChange={v => setFormData({...formData, donationType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="kind">In Kind</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={v => setFormData({...formData, paymentMethod: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Purpose</Label>
              <Input value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} placeholder="e.g. Temple renovation, Festival celebrations" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Transaction ID</Label>
                <Input value={formData.transactionId} onChange={e => setFormData({...formData, transactionId: e.target.value})} placeholder="UPI/bank reference" />
              </div>
              <div className="space-y-1.5">
                <Label>Receipt Number</Label>
                <Input value={formData.receiptNumber} onChange={e => setFormData({...formData, receiptNumber: e.target.value})} placeholder="Auto-generated if blank" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={formData.taxDeductible} onCheckedChange={v => setFormData({...formData, taxDeductible: v})} />
                <Label className="cursor-pointer text-sm">Tax Deductible (80G)</Label>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any additional notes..." rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditDonation(null); }}>Cancel</Button>
              <Button type="submit" disabled={(!formData.anonymousDonation && !formData.devoteeId) || !formData.amount || createMutation.isPending || updateMutation.isPending} className="bg-gradient-to-r from-primary to-secondary">
                {editDonation ? "Save Changes" : "Record Donation"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
