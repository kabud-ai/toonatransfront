import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import ManufacturingOrders from './pages/ManufacturingOrders';
import BillOfMaterials from './pages/BillOfMaterials';
import QualityInspections from './pages/QualityInspections';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Products": Products,
    "Inventory": Inventory,
    "ManufacturingOrders": ManufacturingOrders,
    "BillOfMaterials": BillOfMaterials,
    "QualityInspections": QualityInspections,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};