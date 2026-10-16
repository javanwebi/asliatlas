import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Shield,
  CreditCard,
  Percent,
  Search,
  CheckCircle,
  Clock,
  Send,
  Building,
  Phone,
  Mail,
  UserCheck,
  UserPlus,
  KeyRound,
  Lock,
  X,
  AlertCircle,
  FileText,
  ShoppingBag,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { adminService, SupportTicket } from '../../services/adminService';
import { Customer } from '../../types';
import { formatPrice, toPersianDigits } from '../../utils/formatters';

export const CustomersCrmModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customers' | 'tickets'>('customers');

  // Customers State
  const [customers, setCustomers] = useState<Customer[]>(() => adminService.getCustomers());
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New B2B Customer Creation Modal State
  const [isAddB2bModalOpen, setIsAddB2bModalOpen] = useState(false);
  const [newB2bFullName, setNewB2bFullName] = useState('');
  const [newB2bCompany, setNewB2bCompany] = useState('');
  const [newB2bPhone, setNewB2bPhone] = useState('');
  const [newB2bPassword, setNewB2bPassword] = useState('atlas1403');
  const [newB2bEconomicCode, setNewB2bEconomicCode] = useState('');
  const [newB2bCreditLimit, setNewB2bCreditLimit] = useState<number>(150000000);
  const [newB2bRole, setNewB2bRole] = useState<'wholesale' | 'dealer' | 'factory'>('wholesale');

  // Customer Tier Edit Form
  const [editTier, setEditTier] = useState<Customer['tier']>('regular');
  const [editCreditLimit, setEditCreditLimit] = useState<number>(0);
  const [editDiscountPercent, setEditDiscountPercent] = useState<number>(0);

  // Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>(() => adminService.getTickets());
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');

  const refreshData = () => {
    setCustomers(adminService.getCustomers());
    setTickets(adminService.getTickets());
  };

  const handleCreateB2bCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newB2bFullName.trim() || !newB2bPhone.trim()) return;

    adminService.createB2bCustomer({
      fullName: newB2bFullName,
      companyName: newB2bCompany || 'فروشگاه / کارخانه همکار',
      phone: newB2bPhone,
      password: newB2bPassword || 'atlas1403',
      economicCode: newB2bEconomicCode,
      creditLimit: Number(newB2bCreditLimit),
      role: newB2bRole,
      approvedB2B: true,
    });

    refreshData();
    setIsAddB2bModalOpen(false);
    setNewB2bFullName('');
    setNewB2bCompany('');
    setNewB2bPhone('');
    setNewB2bPassword('atlas1403');
    setNewB2bEconomicCode('');
  };

  const handleToggleB2bAccess = (customerId: string) => {
    adminService.toggleB2bApproval(customerId);
    refreshData();
  };

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const custName = c.name || c.fullName || '';
    const custCompany = c.company || c.companyName || '';
    const custTier = c.tier || (c.role === 'dealer' ? 'dealer' : c.role === 'wholesale' ? 'colleague' : 'regular');
    const matchesSearch =
      custName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      custCompany.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customerSearch));
    const matchesTier = selectedTierFilter === 'all' || custTier === selectedTierFilter;
    return matchesSearch && matchesTier;
  });

  // Filter tickets
  const filteredTickets = tickets.filter(t => {
    if (ticketStatusFilter === 'all') return true;
    return t.status === ticketStatusFilter;
  });

  const handleOpenCustomerModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditTier(customer.tier || (customer.role === 'dealer' ? 'dealer' : customer.role === 'wholesale' ? 'colleague' : 'regular'));
    setEditCreditLimit(customer.creditLimit || 0);
    setEditDiscountPercent(customer.discountPercent || 0);
  };

  const handleSaveCustomerTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    adminService.updateCustomerTier(
      selectedCustomer.id,
      editTier,
      Number(editCreditLimit),
      Number(editDiscountPercent)
    );
    refreshData();
    setSelectedCustomer(null);
  };

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    adminService.replyToTicket(selectedTicket.id, replyMessage.trim(), 'answered');
    refreshData();
    const updated = adminService.getTickets().find(t => t.id === selectedTicket.id);
    setSelectedTicket(updated || null);
    setReplyMessage('');
  };

  const getTierBadge = (tier: Customer['tier']) => {
    switch (tier) {
      case 'regular':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            مشتری عادی
          </span>
        );
      case 'colleague':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            همکار / پخش
          </span>
        );
      case 'factory':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            کارخانه و خطوط تولید
          </span>
        );
      case 'dealer':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            نماینده رسمی
          </span>
        );
    }
  };

  const getTicketStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            باز / بی‌پاسخ
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            در حال پیگیری
          </span>
        );
      case 'answered':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            پاسخ داده شد
          </span>
        );
      case 'closed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
            بسته شده
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#55565A] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#E06518]" />
            <span>مدیریت ارتباط با مشتریان صنعتی (CRM) و تیکت‌ها</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تعیین سطوح دسترسی B2B، تخصیص سقف اعتبار خرید و درصد تخفیف، بررسی تاریخچه و پاسخ به تیکت‌های فنی.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
            {toPersianDigits(customers.length)} شرکت و کارخانه ثبت‌شده
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('customers')}
          className={`py-2 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'customers'
              ? 'bg-[#55565A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>مشتریان و سطوح دسترسی ({toPersianDigits(customers.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`py-2 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'bg-[#55565A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>تیکت‌های پشتیبانی ({toPersianDigits(tickets.length)})</span>
        </button>
      </div>

      {/* --- SUBTAB 1: CUSTOMERS CRM --- */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                placeholder="جستجو با نام شخص، کارخانه، تلفن..."
                className="w-full h-10 pr-9 pl-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#E06518]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedTierFilter}
                onChange={e => setSelectedTierFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-[#E06518]"
              >
                <option value="all">همه سطوح کاربری</option>
                <option value="regular">عادی</option>
                <option value="colleague">همکار / پخش</option>
                <option value="factory">کارخانجات صنعتی</option>
                <option value="dealer">نماینده رسمی</option>
              </select>

              <button
                type="button"
                onClick={() => setIsAddB2bModalOpen(true)}
                className="h-10 px-4 rounded-xl bg-[#E06518] hover:bg-[#C95210] active:scale-95 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ تعریف مشتری اعتباری B2B جدید</span>
              </button>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-[#55565A]">
                    <th className="py-3.5 px-4">نام مخاطب / شرکت</th>
                    <th className="py-3.5 px-4">تلفن تماس</th>
                    <th className="py-3.5 px-4">سطح B2B</th>
                    <th className="py-3.5 px-4">مجوز پرتال اعتباری</th>
                    <th className="py-3.5 px-4">سقف اعتبار خرید</th>
                    <th className="py-3.5 px-4">تخفیف اختصاصی</th>
                    <th className="py-3.5 px-4">کل خرید تاکنون</th>
                    <th className="py-3.5 px-4 text-center">عملیات CRM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map(cust => (
                    <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#55565A]">{cust.name || cust.fullName}</div>
                        <div className="text-[10px] text-slate-400">{cust.company || cust.companyName}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{cust.phone}</td>
                      <td className="py-3.5 px-4">{getTierBadge(cust.tier || (cust.role === 'dealer' ? 'dealer' : cust.role === 'wholesale' ? 'colleague' : 'regular'))}</td>
                      <td className="py-3.5 px-4">
                        {cust.approvedB2B ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>مجوز B2B فعال</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>عادی (در انتظار B2B)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {cust.creditLimit ? `${formatPrice(cust.creditLimit)} ت` : '-'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#C95210]">
                        {cust.discountPercent ? `${toPersianDigits(cust.discountPercent)}٪` : '-'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#55565A]">
                        {formatPrice(cust.totalOrdersAmount || 0)} ت
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenCustomerModal(cust)}
                            className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#55565A] font-bold text-[11px] cursor-pointer"
                            title="تنظیم سطح و سقف اعتبار"
                          >
                            تنظیم سقف
                          </button>

                          <button
                            onClick={() => handleToggleB2bAccess(cust.id)}
                            className={`py-1.5 px-2.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                              cust.approvedB2B
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                            title={cust.approvedB2B ? 'تعلیق دسترسی B2B' : 'اعطای مجوز دسترسی به پرتال B2B'}
                          >
                            {cust.approvedB2B ? 'تعلیق B2B' : 'تایید B2B'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: TICKETS --- */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-600">فهرست تیکت‌ها</h3>
              <select
                value={ticketStatusFilter}
                onChange={e => setTicketStatusFilter(e.target.value)}
                className="h-8 px-2 rounded-lg border border-slate-200 text-xs bg-white outline-none"
              >
                <option value="all">همه</option>
                <option value="open">بی‌پاسخ</option>
                <option value="answered">پاسخ داده شده</option>
                <option value="closed">بسته</option>
              </select>
            </div>

            <div className="space-y-2">
              {filteredTickets.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-2xl border text-right cursor-pointer transition-all ${
                    selectedTicket?.id === t.id
                      ? 'bg-orange-50/70 border-[#E06518] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-slate-400">#{t.id}</span>
                    {getTicketStatusBadge(t.status)}
                  </div>
                  <h4 className="font-bold text-xs text-[#55565A] line-clamp-1">{t.subject}</h4>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{t.customerName}</span>
                    <span>{t.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Conversation View */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            {selectedTicket ? (
              <>
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-black text-sm text-[#55565A]">{selectedTicket.subject}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      ارسال‌کننده: <b className="text-slate-700">{selectedTicket.customerName}</b> ({selectedTicket.phone})
                    </div>
                  </div>
                  {getTicketStatusBadge(selectedTicket.status)}
                </div>

                {/* Messages Thread */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {selectedTicket.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl text-xs space-y-1 ${
                        msg.sender === 'admin'
                          ? 'bg-[#55565A] text-white ml-6'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-75 font-bold">
                        <span>{msg.sender === 'admin' ? 'کارشناس پشتیبانی اطلس' : selectedTicket.customerName}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Box */}
                <form onSubmit={handleSendTicketReply} className="space-y-3 pt-4 border-t border-slate-100">
                  <textarea
                    rows={3}
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    placeholder="پاسخ به تیکت مشتری..."
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs outline-none focus:border-[#E06518]"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-[#55565A] hover:bg-[#1B293E] text-white font-black text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-[#E06518]" />
                      <span>ارسال پاسخ و اطلاع‌رسانی پیامکی</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                جهت مشاهده متن گفتگو، یک تیکت از ستون راست را انتخاب فرمایید.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CUSTOMER TIER & LIMIT MODAL --- */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div>
              <h3 className="font-black text-sm text-[#55565A]">
                تنظیم سطح دسترسی B2B و سقف اعتبار: {selectedCustomer.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                شرکت: {selectedCustomer.company} | تلفن: {selectedCustomer.phone}
              </p>
            </div>

            <form onSubmit={handleSaveCustomerTier} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">سطح کاربری B2B</label>
                <select
                  value={editTier}
                  onChange={e => setEditTier(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none"
                >
                  <option value="regular">مشتری گرامی (استعلام قیمت پایه)</option>
                  <option value="colleague">همکار / شبکه پخش (قیمت‌های عمده)</option>
                  <option value="factory">کارخانه و خط تولید (امکان خرید اعتباری)</option>
                  <option value="dealer">نمایندگی رسمی (کمترین قیمت و بالاترین سقف)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">سقف مجاز خرید اعتباری ۳۰ روزه (تومان)</label>
                <input
                  type="number"
                  value={editCreditLimit}
                  onChange={e => setEditCreditLimit(Number(e.target.value))}
                  placeholder="مثلاً ۱۰۰۰۰۰۰۰۰"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">درصد تخفیف اختصاصی مازاد بر سطح (٪)</label>
                <input
                  type="number"
                  value={editDiscountPercent}
                  onChange={e => setEditDiscountPercent(Number(e.target.value))}
                  placeholder="مثلاً ۵"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono font-bold outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#55565A] text-white text-xs font-black shadow-xs cursor-pointer"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- ADD NEW B2B CUSTOMER MODAL --- */}
      {isAddB2bModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#E06518] flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#55565A]">
                    تعریف مشتری اعتباری B2B جدید
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    تعریف حساب اختصاصی، رمز عبور و سقف چک صیادی
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddB2bModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateB2bCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    نام و نام خانوادگی مسئول <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newB2bFullName}
                    onChange={e => setNewB2bFullName(e.target.value)}
                    placeholder="مثلاً مهندس مرتضی دهقانی"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#E06518]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">نام شرکت / کارخانه / فروشگاه</label>
                  <input
                    type="text"
                    value={newB2bCompany}
                    onChange={e => setNewB2bCompany(e.target.value)}
                    placeholder="مثلاً کاشی ستاره میبد"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#E06518]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    شماره موبایل (نام کاربری) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={newB2bPhone}
                    onChange={e => setNewB2bPhone(e.target.value)}
                    placeholder="0913 123 4567"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono text-left bg-white outline-none focus:border-[#E06518]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">رمز عبور اختصاصی ورود به پرتال</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newB2bPassword}
                    onChange={e => setNewB2bPassword(e.target.value)}
                    placeholder="atlas1403"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono text-left bg-white outline-none focus:border-[#E06518]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">سطح همکاری B2B</label>
                  <select
                    value={newB2bRole}
                    onChange={e => setNewB2bRole(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#E06518]"
                  >
                    <option value="wholesale">همکار / شبکه پخش (Wholesale)</option>
                    <option value="factory">کارخانه و خطوط تولید (Factory)</option>
                    <option value="dealer">نمایندگی انحصاری استان (Dealer)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">سقف اعتبار چکی صیادی (تومان)</label>
                  <input
                    type="number"
                    value={newB2bCreditLimit}
                    onChange={e => setNewB2bCreditLimit(Number(e.target.value))}
                    placeholder="150000000"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono font-bold outline-none focus:border-[#E06518]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">کد اقتصادی / شناسه ملی</label>
                <input
                  type="text"
                  dir="ltr"
                  value={newB2bEconomicCode}
                  onChange={e => setNewB2bEconomicCode(e.target.value)}
                  placeholder="411298456123"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono text-left bg-white outline-none focus:border-[#E06518]"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>صدور آنی مجوز B2B</span>
                </div>
                <p>
                  با ثبت این فرم، مجوز ورود به پرتال B2B فوراً فعال گردیده و کاربر می‌تواند با شماره موبایل و رمز عبور وارد شود.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddB2bModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#E06518] hover:bg-[#C95210] text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>ثبت و فعال‌سازی حساب B2B</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
