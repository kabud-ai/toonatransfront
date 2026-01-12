import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import ManufacturingOrders from './pages/ManufacturingOrders';
import BillOfMaterials from './pages/BillOfMaterials';
import QualityInspections from './pages/QualityInspections';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import Equipment from './pages/Equipment';
import MaintenanceOrders from './pages/MaintenanceOrders';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Products": Products,
    "Inventory": Inventory,
    "ManufacturingOrders": ManufacturingOrders,
    "BillOfMaterials": BillOfMaterials,
    "QualityInspections": QualityInspections,
    "Suppliers": Suppliers,
    "PurchaseOrders": PurchaseOrders,
    "Equipment": Equipment,
    "MaintenanceOrders": MaintenanceOrders,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};