import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Search,
  Package,
  Truck,
  ShoppingCart,
  PackageCheck,
  Factory,
  Layers,
  FileText,
  Filter,
  X,
  CalendarIcon,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function GlobalSearch({ open, onOpenChange }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModule, setActiveModule] = useState('all');
  const [filters, setFilters] = useState({
    status: '',
    supplier: '',
    warehouse: '',
    dateFrom: null,
    dateTo: null
  });
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data for search
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['search-products', debouncedQuery],
    queryFn: () => base44.entities.Product.list('-created_date', 50),
    enabled: debouncedQuery.length > 0
  });

  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ['search-suppliers', debouncedQuery],
    queryFn: () => base44.entities.Supplier.list('-created_date', 50),
    enabled: debouncedQuery.length > 0
  });

  const { data: purchaseOrders = [], isLoading: loadingPO } = useQuery({
    queryKey: ['search-po', debouncedQuery],
    queryFn: () => base44.entities.PurchaseOrder.list('-created_date', 50),
    enabled: debouncedQuery.length > 0
  });

  const { data: goodsReceipts = [], isLoading: loadingGR } = useQuery({
    queryKey: ['search-gr', debouncedQuery],
    queryFn: () => base44.entities.GoodsReceipt.list('-created_date', 50),
    enabled: debouncedQuery.length > 0
  });

  const { data: manufacturingOrders = [], isLoading: loadingMO } = useQuery({
    queryKey: ['search-mo', debouncedQuery],
    queryFn: () => base44.entities.ManufacturingOrder.list('-created_date', 50),
    enabled: debouncedQuery.length > 0
  });

  const { data: lots = [], isLoading: loadingLots } = useQuery({
    queryKey: ['search-lots', debouncedQuery],
    queryFn: () => base44.entities.ProductLot.list('-created_date', 50),
    enabled: debouncedQuery.length > 0
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => base44.entities.Warehouse.list()
  });

  const isLoading = loadingProducts || loadingSuppliers || loadingPO || loadingGR || loadingMO || loadingLots;

  const filterResults = (items, type) => {
    if (!debouncedQuery && !filters.status && !filters.supplier && !filters.warehouse) return items;

    return items.filter(item => {
      const query = debouncedQuery.toLowerCase();
      
      // Text search
      const matchesSearch = !debouncedQuery || 
        (item.name?.toLowerCase().includes(query)) ||
        (item.code?.toLowerCase().includes(query)) ||
        (item.order_number?.toLowerCase().includes(query)) ||
        (item.receipt_number?.toLowerCase().includes(query)) ||
        (item.lot_number?.toLowerCase().includes(query)) ||
        (item.product_name?.toLowerCase().includes(query)) ||
        (item.supplier_name?.toLowerCase().includes(query));

      // Status filter
      const matchesStatus = !filters.status || item.status === filters.status;

      // Supplier filter
      const matchesSupplier = !filters.supplier || item.supplier_id === filters.supplier || item.supplier_name === filters.supplier;

      // Warehouse filter
      const matchesWarehouse = !filters.warehouse || item.warehouse_id === filters.warehouse || item.warehouse_name === filters.warehouse;

      // Date filter
      let matchesDate = true;
      if (filters.dateFrom || filters.dateTo) {
        const itemDate = new Date(item.created_date || item.order_date || item.receipt_date || item.planned_start_date);
        if (filters.dateFrom) matchesDate = matchesDate && itemDate >= filters.dateFrom;
        if (filters.dateTo) matchesDate = matchesDate && itemDate <= filters.dateTo;
      }

      return matchesSearch && matchesStatus && matchesSupplier && matchesWarehouse && matchesDate;
    });
  };

  const filteredProducts = filterResults(products, 'product');
  const filteredSuppliers = filterResults(suppliers, 'supplier');
  const filteredPO = filterResults(purchaseOrders, 'po');
  const filteredGR = filterResults(goodsReceipts, 'gr');
  const filteredMO = filterResults(manufacturingOrders, 'mo');
  const filteredLots = filterResults(lots, 'lot');

  const totalResults = filteredProducts.length + filteredSuppliers.length + 
                       filteredPO.length + filteredGR.length + 
                       filteredMO.length + filteredLots.length;

  const clearFilters = () => {
    setFilters({
      status: '',
      supplier: '',
      warehouse: '',
      dateFrom: null,
      dateTo: null
    });
  };

  const hasActiveFilters = filters.status || filters.supplier || filters.warehouse || filters.dateFrom || filters.dateTo;

  const ResultItem = ({ item, icon: Icon, type, page }) => (
    <Link
      to={createPageUrl(page)}
      onClick={() => onOpenChange(false)}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
    >
      <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 truncate">
            {item.name || item.order_number || item.receipt_number || item.lot_number}
          </p>
          {item.status && (
            <Badge className="text-xs flex-shrink-0">
              {item.status}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
          {item.code && <span className="font-mono">{item.code}</span>}
          {item.supplier_name && <span>• {item.supplier_name}</span>}
          {item.warehouse_name && <span>• {item.warehouse_name}</span>}
          {item.product_name && <span>• {item.product_name}</span>}
        </div>
      </div>
    </Link>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <Search className="h-5 w-5 text-slate-400" />
            {t('search.globalSearch') || 'Recherche Globale'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t('search.searchPlaceholder') || 'Rechercher produits, commandes, fournisseurs...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              className={cn(hasActiveFilters && "border-indigo-500 text-indigo-600")}
            >
              <Filter className="h-3 w-3 mr-2" />
              {t('search.filters') || 'Filtres'}
            </Button>

            <Select value={filters.status} onValueChange={(val) => setFilters({...filters, status: val})}>
              <SelectTrigger className="w-36 h-8">
                <SelectValue placeholder={t('common.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">{t('common.all')}</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.supplier} onValueChange={(val) => setFilters({...filters, supplier: val})}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder={t('common.supplier')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">{t('common.all')}</SelectItem>
                {suppliers.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.warehouse} onValueChange={(val) => setFilters({...filters, warehouse: val})}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder={t('common.warehouse')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">{t('common.all')}</SelectItem>
                {warehouses.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <CalendarIcon className="h-3 w-3 mr-2" />
                  {filters.dateFrom ? format(filters.dateFrom, 'dd/MM') : t('search.dateFrom') || 'De'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => setFilters({...filters, dateFrom: date})}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <CalendarIcon className="h-3 w-3 mr-2" />
                  {filters.dateTo ? format(filters.dateTo, 'dd/MM') : t('search.dateTo') || 'À'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) => setFilters({...filters, dateTo: date})}
                />
              </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
                <X className="h-3 w-3 mr-2" />
                {t('search.clearFilters') || 'Effacer'}
              </Button>
            )}
          </div>

          {/* Results count */}
          {debouncedQuery && (
            <p className="text-sm text-slate-500">
              {totalResults} {t('search.resultsFound') || 'résultats trouvés'}
            </p>
          )}
        </div>

        {/* Results Tabs */}
        <Tabs value={activeModule} onValueChange={setActiveModule} className="flex-1 overflow-hidden">
          <TabsList className="w-full justify-start px-6 rounded-none border-b bg-transparent h-12">
            <TabsTrigger value="all" className="gap-2">
              {t('common.all')} <Badge variant="outline">{totalResults}</Badge>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-3 w-3" /> {t('nav.products')} <Badge variant="outline">{filteredProducts.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-2">
              <Truck className="h-3 w-3" /> {t('nav.suppliers')} <Badge variant="outline">{filteredSuppliers.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-3 w-3" /> {t('nav.purchaseOrders')} <Badge variant="outline">{filteredPO.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="receipts" className="gap-2">
              <PackageCheck className="h-3 w-3" /> {t('goodsReceipt.title')} <Badge variant="outline">{filteredGR.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="manufacturing" className="gap-2">
              <Factory className="h-3 w-3" /> MO <Badge variant="outline">{filteredMO.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="lots" className="gap-2">
              <Layers className="h-3 w-3" /> Lots <Badge variant="outline">{filteredLots.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] px-6 py-4">
            <TabsContent value="all" className="space-y-1 mt-0">
              {filteredProducts.map(item => (
                <ResultItem key={item.id} item={item} icon={Package} type="product" page="Products" />
              ))}
              {filteredSuppliers.map(item => (
                <ResultItem key={item.id} item={item} icon={Truck} type="supplier" page="Suppliers" />
              ))}
              {filteredPO.map(item => (
                <ResultItem key={item.id} item={item} icon={ShoppingCart} type="po" page="PurchaseOrders" />
              ))}
              {filteredGR.map(item => (
                <ResultItem key={item.id} item={item} icon={PackageCheck} type="gr" page="GoodsReceipts" />
              ))}
              {filteredMO.map(item => (
                <ResultItem key={item.id} item={item} icon={Factory} type="mo" page="ManufacturingOrders" />
              ))}
              {filteredLots.map(item => (
                <ResultItem key={item.id} item={item} icon={Layers} type="lot" page="LotTracking" />
              ))}
              {totalResults === 0 && debouncedQuery && (
                <div className="text-center py-8 text-slate-500">
                  {t('search.noResults') || 'Aucun résultat trouvé'}
                </div>
              )}
            </TabsContent>

            <TabsContent value="products" className="space-y-1 mt-0">
              {filteredProducts.map(item => (
                <ResultItem key={item.id} item={item} icon={Package} type="product" page="Products" />
              ))}
              {filteredProducts.length === 0 && debouncedQuery && (
                <div className="text-center py-8 text-slate-500">
                  {t('search.noResults') || 'Aucun résultat trouvé'}
                </div>
              )}
            </TabsContent>

            <TabsContent value="suppliers" className="space-y-1 mt-0">
              {filteredSuppliers.map(item => (
                <ResultItem key={item.id} item={item} icon={Truck} type="supplier" page="Suppliers" />
              ))}
              {filteredSuppliers.length === 0 && debouncedQuery && (
                <div className="text-center py-8 text-slate-500">
                  {t('search.noResults') || 'Aucun résultat trouvé'}
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders" className="space-y-1 mt-0">
              {filteredPO.map(item => (
                <ResultItem key={item.id} item={item} icon={ShoppingCart} type="po" page="PurchaseOrders" />
              ))}
              {filteredPO.length === 0 && debouncedQuery && (
                <div className="text-center py-8 text-slate-500">
                  {t('search.noResults') || 'Aucun résultat trouvé'}
                </div>
              )}
            </TabsContent>

            <TabsContent value="receipts" className="space-y-1 mt-0">
              {filteredGR.map(item => (
                <ResultItem key={item.id} item={item} icon={PackageCheck} type="gr" page="GoodsReceipts" />
              ))}
              {filteredGR.length === 0 && debouncedQuery && (
                <div className="text-center py-8 text-slate-500">
                  {t('search.noResults') || 'Aucun résultat trouvé'}
                </div>
              )}
            </TabsContent>

            <TabsContent value="manufacturing" className="space-y-1 mt-0">
              {filteredMO.map(item => (
                <ResultItem key={item.id} item={item} icon={Factory} type="mo" page="ManufacturingOrders" />
              ))}
              {filteredMO.length === 0 && debouncedQuery && (
                <div className="text-center py-8 text-slate-500">
                  {t('search.noResults') || 'Aucun résultat trouvé'}
                </div>
              )}
            </TabsContent>

            <TabsContent value="lots" className="space-y-1 mt-0">
              {filteredLots.map(item => (
                <ResultItem key={item.id} item={item} icon={Layers} type="lot" page="LotTracking" />
              ))}
              {filteredLots.length === 0 && debouncedQuery && (
                <div className="text-center py-8 text-slate-500">
                  {t('search.noResults') || 'Aucun résultat trouvé'}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="px-6 py-3 border-t bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 text-center">
            {t('search.tip') || 'Astuce: Utilisez les filtres pour affiner votre recherche'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}