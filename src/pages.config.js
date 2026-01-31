/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AutoReplenishment from './pages/AutoReplenishment';
import BillOfMaterials from './pages/BillOfMaterials';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import GoodsReceipts from './pages/GoodsReceipts';
import Inventory from './pages/Inventory';
import LotTracking from './pages/LotTracking';
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
import RolesManagement from './pages/RolesManagement';
import Settings from './pages/Settings';
import Sites from './pages/Sites';
import StockAlerts from './pages/StockAlerts';
import SupplierCatalog from './pages/SupplierCatalog';
import Suppliers from './pages/Suppliers';
import Unities from './pages/Unities';
import UserManagement from './pages/UserManagement';
import UserProfile from './pages/UserProfile';
import Warehouses from './pages/Warehouses';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AutoReplenishment": AutoReplenishment,
    "BillOfMaterials": BillOfMaterials,
    "Dashboard": Dashboard,
    "Equipment": Equipment,
    "GoodsReceipts": GoodsReceipts,
    "Inventory": Inventory,
    "LotTracking": LotTracking,
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
    "RolesManagement": RolesManagement,
    "Settings": Settings,
    "Sites": Sites,
    "StockAlerts": StockAlerts,
    "SupplierCatalog": SupplierCatalog,
    "Suppliers": Suppliers,
    "Unities": Unities,
    "UserManagement": UserManagement,
    "UserProfile": UserProfile,
    "Warehouses": Warehouses,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};