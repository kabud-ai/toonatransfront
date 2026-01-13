import BillOfMaterials from './pages/BillOfMaterials';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Inventory from './pages/Inventory';
import MaintenanceOrders from './pages/MaintenanceOrders';
import ManufacturingOrders from './pages/ManufacturingOrders';
import ProductionPlanning from './pages/ProductionPlanning';
import ProductionPlans from './pages/ProductionPlans';
import Products from './pages/Products';
import PurchaseOrders from './pages/PurchaseOrders';
import QualityInspections from './pages/QualityInspections';
import RawMaterials from './pages/RawMaterials';
import RecipeHistory from './pages/RecipeHistory';
import RecipeTypes from './pages/RecipeTypes';
import Recipes from './pages/Recipes';
import Settings from './pages/Settings';
import Sites from './pages/Sites';
import Suppliers from './pages/Suppliers';
import Unities from './pages/Unities';
import UserManagement from './pages/UserManagement';
import Warehouses from './pages/Warehouses';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BillOfMaterials": BillOfMaterials,
    "Dashboard": Dashboard,
    "Equipment": Equipment,
    "Inventory": Inventory,
    "MaintenanceOrders": MaintenanceOrders,
    "ManufacturingOrders": ManufacturingOrders,
    "ProductionPlanning": ProductionPlanning,
    "ProductionPlans": ProductionPlans,
    "Products": Products,
    "PurchaseOrders": PurchaseOrders,
    "QualityInspections": QualityInspections,
    "RawMaterials": RawMaterials,
    "RecipeHistory": RecipeHistory,
    "RecipeTypes": RecipeTypes,
    "Recipes": Recipes,
    "Settings": Settings,
    "Sites": Sites,
    "Suppliers": Suppliers,
    "Unities": Unities,
    "UserManagement": UserManagement,
    "Warehouses": Warehouses,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};