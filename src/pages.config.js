import BillOfMaterials from './pages/BillOfMaterials';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Inventory from './pages/Inventory';
import MaintenanceOrders from './pages/MaintenanceOrders';
import ManufacturingOrders from './pages/ManufacturingOrders';
import ProductionPlanning from './pages/ProductionPlanning';
import Products from './pages/Products';
import PurchaseOrders from './pages/PurchaseOrders';
import QualityInspections from './pages/QualityInspections';
import Settings from './pages/Settings';
import Sites from './pages/Sites';
import Suppliers from './pages/Suppliers';
import UserManagement from './pages/UserManagement';
import Warehouses from './pages/Warehouses';
import Recipes from './pages/Recipes';
import RawMaterials from './pages/RawMaterials';
import Unities from './pages/Unities';
import RecipeTypes from './pages/RecipeTypes';
import RecipeHistory from './pages/RecipeHistory';
import ProductionPlans from './pages/ProductionPlans';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BillOfMaterials": BillOfMaterials,
    "Dashboard": Dashboard,
    "Equipment": Equipment,
    "Inventory": Inventory,
    "MaintenanceOrders": MaintenanceOrders,
    "ManufacturingOrders": ManufacturingOrders,
    "ProductionPlanning": ProductionPlanning,
    "Products": Products,
    "PurchaseOrders": PurchaseOrders,
    "QualityInspections": QualityInspections,
    "Settings": Settings,
    "Sites": Sites,
    "Suppliers": Suppliers,
    "UserManagement": UserManagement,
    "Warehouses": Warehouses,
    "Recipes": Recipes,
    "RawMaterials": RawMaterials,
    "Unities": Unities,
    "RecipeTypes": RecipeTypes,
    "RecipeHistory": RecipeHistory,
    "ProductionPlans": ProductionPlans,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};