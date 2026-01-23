
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'admin.html');
let content = fs.readFileSync(filePath, 'utf8');

// Helper to replace multiline strings leniently
function replaceLenient(text, search, replace) {
    // Escape search string for regex, but allow whitespace for spaces
    const parts = search.split(/\s+/);
    const regexStr = parts.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
    const regex = new RegExp(regexStr, 'g');
    return text.replace(regex, replace);
}

// 1. Specific multiline or split strings
content = replaceLenient(content, '>إعادة تعيين<', '>Réinitialiser<');
content = replaceLenient(content, '>غير مقروء<', '>Non lu<');

// 2. Headings and labels
content = content.replace(/تسجيل الدخول/g, 'Se connecter'); // Login page title?
content = content.replace(/>الRechercher</g, '>Recherche<');
content = content.replace(/Paramètres العامة/g, 'Paramètres généraux');
content = content.replace(/'إدارة الproduitات'/g, "'Gestion des produits'");
content = content.replace(/'الرسائل'/g, "'Messages'");
content = content.replace(/Total الكلي/g, 'Total général');
content = content.replace(/الproduitات/g, 'Produits'); // Generic fallback

// 3. Placeholders and attribute values
content = content.replace(/placeholder="اRechercher بN° commande أو اسم Client..."/g, 'placeholder="Rechercher par N° commande ou nom du client..."');

// 4. Dummy Data Messages
content = content.replace(/message: 'السلام عليكم، أريد الاستفسار عن توصيل...'/g, "message: 'Bonjour, je voudrais me renseigner sur la livraison...'");
content = content.replace(/message: 'ما هي أوقات العمل لديكم؟'/g, "message: 'Quelles sont vos heures d\\'ouverture ?'");

// 5. Remaining strings from scan
content = content.replace(/Aucun produit في هذا الطلب/g, 'Aucun produit dans cette commande');
content = content.replace(/'Modifier الproduit'/g, "'Modifier le produit'");
content = content.replace(/'Ajout الproduit'/g, "'Ajouter un produit'"); // Guessing the other branch
content = content.replace(/Une erreur est survenue في/g, 'Une erreur est survenue dans');
content = content.replace(/Veuillez تسجيل/g, 'Veuillez vous enregistrer'); // Fallback
content = content.replace(/Veuillez تسجيل الدخول/g, 'Veuillez vous connecter');

// 6. Fix "Rechercher" typo from previous scripts if any
content = content.replace(/الRechercher/g, 'Rechercher');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Final V3 cleanup complete.');
