const fs = require('fs');
const path = require('path');

// File to clean
const adminFile = path.join(__dirname, 'admin.html');

console.log('🧹 Cleaning remaining Arabic content from admin.html...');

// Read the file
let content = fs.readFileSync(adminFile, 'utf8');
const originalSize = content.length;

// Extended replacements for mixed content and remaining Arabic
const replacements = [
    // Mixed content from previous partial replacement
    ['produitات الأطفال', 'Produits bébé'],
    ['تفاصيل Client', 'Détails du client'],
    ['عدد Commandes', 'Nombre de commandes'],
    ['إجمالي المشتريات', 'Total des achats'],
    ['رابط Image', 'Lien de l\'image'],
    ['ليس لديك صلاحية للEnregistrer', 'Vous n\'avez pas la permission d\'enregistrer'],
    ['تم Actualiser الproduit بنجاح', 'Produit mis à jour avec succès'],
    ['تم Ajouter الproduit بنجاح', 'Produit ajouté avec succès'],
    ['تم بنجاح', 'avec succès'],
    ['حدث خطأ', 'Une erreur est survenue'],
    ['إغلاق', 'Fermer'],
    ['عميل', 'Client'],
    ['الماركة', 'Marque'],
    ['اسم الماركة', 'Nom de la marque'],
    ['الجمعة', 'Vendredi'],
    ['يناير', 'Janvier'],
    ['٢٠٢٦', '2026'],
    ['٢٣', '23'],
    ['٢', '2'],

    // Additional found in recent view
    ['الأدوية', 'Médicaments'],
    ['الفيتامينات', 'Vitamines'],
    ['العناية بالبشرة', 'Soins de la peau'],
    ['الأجهزة الطبية', 'Équipements médicaux'],
    ['النظافة', 'Hygiène'],
    ['عرض الكل', 'Voir tout'],
    ['آخر الطلبات', 'Dernières commandes'],
    ['حالة الطلب', 'État de la commande'],

    // Statuses that might be in Arabic in JS
    ['قيد الانتظار', 'En attente'],
    ['قيد التحضير', 'En préparation'],
    ['في الطريق', 'En livraison'],
    ['تم التوصيل', 'Livré']
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

console.log('✅ Final cleaning complete!');
console.log(`📊 Removed/Replaced ${removed} bytes of mixed content`);
