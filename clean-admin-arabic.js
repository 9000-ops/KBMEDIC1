const fs = require('fs');
const path = require('path');

// File to clean
const adminFile = path.join(__dirname, 'admin.html');

console.log('🧹 Cleaning Arabic content from admin.html...');

// Read the file
let content = fs.readFileSync(adminFile, 'utf8');
const originalSize = content.length;

// Remove data-ar attributes
content = content.replace(/\s+data-ar="[^"]*"/g, '');

// Remove data-placeholder-ar attributes
content = content.replace(/\s+data-placeholder-ar="[^"]*"/g, '');

// Common Arabic text replacements for admin panel
const replacements = [
    // Dashboard
    ['لوحة التحكم', 'Tableau de bord'],
    ['الإحصائيات', 'Statistiques'],
    ['إجمالي الطلبات', 'Total des commandes'],
    ['إجمالي المبيعات', 'Total des ventes'],
    ['إجمالي العملاء', 'Total des clients'],
    ['المخزون', 'Stock'],
    ['منتج', 'produit'],
    ['منتجات', 'produits'],

    // Products
    ['إدارة المنتجات', 'Gestion des produits'],
    ['المنتجات', 'Produits'],
    ['إضافة منتج', 'Ajouter un produit'],
    ['إضافة منتج جديد', 'Ajouter un nouveau produit'],
    ['تعديل المنتج', 'Modifier le produit'],
    ['حذف المنتج', 'Supprimer le produit'],
    ['الصورة', 'Image'],
    ['الاسم', 'Nom'],
    ['الفئة', 'Catégorie'],
    ['السعر', 'Prix'],
    ['الإجراءات', 'Actions'],
    ['بحث عن منتج', 'Rechercher un produit'],
    ['ابحث عن منتج', 'Rechercher un produit'],

    // Orders
    ['إدارة الطلبات', 'Gestion des commandes'],
    ['الطلبات', 'Commandes'],
    ['رقم الطلب', 'N° commande'],
    ['العميل', 'Client'],
    ['الحالة', 'Statut'],
    ['التاريخ', 'Date'],
    ['المجموع', 'Total'],
    ['قيد الانتظار', 'En attente'],
    ['قيد التحضير', 'En préparation'],
    ['في الطريق', 'En livraison'],
    ['تم التوصيل', 'Livré'],
    ['تفاصيل الطلب', 'Détails de la commande'],

    // Categories
    ['إدارة الفئات', 'Gestion des catégories'],
    ['الفئات', 'Catégories'],
    ['إضافة فئة', 'Ajouter une catégorie'],

    // Customers
    ['إدارة العملاء', 'Gestion des clients'],
    ['العملاء', 'Clients'],
    ['البريد الإلكتروني', 'Email'],
    ['الهاتف', 'Téléphone'],
    ['العنوان', 'Adresse'],

    // Settings
    ['الإعدادات', 'Paramètres'],
    ['الإعدادات العامة', 'Paramètres généraux'],
    ['اسم المتجر', 'Nom du magasin'],
    ['إعدادات الدفع', 'Paramètres de paiement'],

    // Common buttons
    ['حفظ', 'Enregistrer'],
    ['إلغاء', 'Annuler'],
    ['تعديل', 'Modifier'],
    ['حذف', 'Supprimer'],
    ['عرض', 'Voir'],
    ['بحث', 'Rechercher'],
    ['تصفية', 'Filtrer'],
    ['تحديث', 'Actualiser'],
    ['إضافة', 'Ajouter'],
    ['تصدير', 'Exporter'],

    // Messages
    ['تم بنجاح', 'avec succès'],
    ['حدث خطأ', 'Une erreur est survenue'],
    ['هل أنت متأكد', 'Êtes-vous sûr'],
    ['يرجى', 'Veuillez'],
    ['لا توجد', 'Aucun'],
    ['غير موجود', 'introuvable'],

    // Days
    ['الأحد', 'Dimanche'],
    ['الاثنين', 'Lundi'],
    ['الثلاثاء', 'Mardi'],
    ['الأربعاء', 'Mercredi'],
    ['الخميس', 'Jeudi'],
    ['الجمعة', 'Vendredi'],
    ['السبت', 'Samedi'],
];

// Apply replacements
replacements.forEach(([arabic, french]) => {
    const regex = new RegExp(arabic, 'g');
    content = content.replace(regex, french);
});

// Write back
fs.writeFileSync(adminFile, content, 'utf8');

const newSize = content.length;
const removed = originalSize - newSize;

console.log('✅ Cleaning complete!');
console.log(`📊 Removed ${removed} bytes of Arabic content`);
console.log(`📄 File: ${adminFile}`);
