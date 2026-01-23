
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'admin.html');
let content = fs.readFileSync(filePath, 'utf8');

// Define specific strict replacements first (longer matches first)
const replacements = [
    // UI Elements
    { from: '>الكل<', to: '>Tout<' },
    { from: '>إعادة تعيين<', to: '>Réinitialiser<' },
    { from: '>قائمة Clients<', to: '>Liste des clients<' },
    { from: '>الرسائل الواردة<', to: '>Messages reçus<' },
    { from: '>الرد<', to: '>Réponse<' },
    { from: '>إرسال<', to: '>Envoyer<' },
    { from: '>رقم Téléphone<', to: '>Numéro de téléphone<' },
    { from: '>الدفع عند الاستلام<', to: '>Paiement à la livraison<' },
    { from: '>تفعيل الدفع عند الاستلام<', to: '>Activer le paiement à la livraison<' },
    { from: '>رسوم التوصيل<', to: '>Frais de livraison<' },
    { from: '>تكلفة التوصيل الثابتة<', to: '>Coût de livraison fixe<' },
    { from: '>Ajouter produit جديد<', to: '>Ajouter un nouveau produit<' },
    { from: '>Nom بالعربية<', to: '>Nom (Arabe)<' },
    { from: '>Nom بالفرنسية<', to: '>Nom (Français)<' },
    { from: '>Prix (دج)<', to: '>Prix (DA)<' },
    { from: '>البريد<', to: '>Email<' },
    { from: '>نقاط الولاء<', to: '>Points de fidélité<' },
    { from: '>غير مقروء<', to: '>Non lu<' },

    // Placeholders
    { from: 'placeholder="الRechercher عن produit..."', to: 'placeholder="Rechercher un produit..."' },
    { from: 'placeholder="اسم الproduit بالعربية"', to: 'placeholder="Nom du produit (Arabe)"' },
    { from: 'placeholder="اكتب ردك هنا..."', to: 'placeholder="Écrivez votre réponse ici..."' },
    { from: 'placeholder="اسم Marque"', to: 'placeholder="Nom de la marque"' },
    { from: 'placeholder="أدخل اسم Catégorie الجديدة:"', to: 'placeholder="Entrez le nom de la nouvelle catégorie"' },

    // Notifications / Toasts / Confirms (Use double quotes for JS strings to handle apostrophes)
    { from: "showToast('مرحباً بك أيها المسؤول!', 'success')", to: "showToast('Bienvenue Admin !', 'success')" },
    { from: "showToast('بيانات الدخول غير صحيحة', 'error')", to: "showToast('Identifiants incorrects', 'error')" },
    { from: "showToast('تم تسجيل الخروج بنجاح', 'info')", to: "showToast('Déconnexion réussie', 'info')" },
    { from: "showToast('تم Supprimer الكاش بنجاح - جارٍ إعادة تحميل البيانات...', 'success')", to: "showToast('Cache effacé avec succès - Rechargement...', 'success')" },
    { from: "showToast('تم Actualiser État de la commande بنجاح', 'success')", to: "showToast('État de la commande mis à jour avec succès', 'success')" },
    { from: "showToast('تم Actualiser البيانات', 'success')", to: "showToast('Données mises à jour avec succès', 'success')" },
    { from: "showToast('تم Supprimer الطلب بنجاح', 'success')", to: "showToast('Commande supprimée avec succès', 'success')" },
    { from: "showToast('Veuillez تسجيل الدخول أولاً', 'error')", to: "showToast('Veuillez vous connecter d\\'abord', 'error')" },
    { from: "showToast('ليس لديك صلاحية للSupprimer', 'error')", to: "showToast(\"Vous n'avez pas la permission de supprimer\", 'error')" },
    { from: "showToast('ليس لديك صلاحية للAjouter', 'error')", to: "showToast(\"Vous n'avez pas la permission d'ajouter\", 'error')" },
    { from: "showToast('تم Supprimer الproduit بنجاح', 'success')", to: "showToast('Produit supprimé avec succès', 'success')" },
    { from: "showToast('تم Modifier Catégorie بنجاح', 'success')", to: "showToast('Catégorie modifiée avec succès', 'success')" },
    { from: "showToast('تم Supprimer Catégorie بنجاح', 'success')", to: "showToast('Catégorie supprimée avec succès', 'success')" },
    { from: "showToast('تم Ajouter Catégorie بنجاح', 'success')", to: "showToast('Catégorie ajoutée avec succès', 'success')" },
    { from: "showToast('تم Supprimer Client بنجاح', 'success')", to: "showToast('Client supprimé avec succès', 'success')" },
    { from: "showToast('تم إرسال الرد بنجاح', 'success')", to: "showToast('Réponse envoyée avec succès', 'success')" },
    { from: "showToast('تم Supprimer الرسالة', 'success')", to: "showToast('Message supprimé avec succès', 'success')" },
    { from: "showToast('تم Enregistrer Paramètres بنجاح', 'success')", to: "showToast('Paramètres enregistrés avec succès', 'success')" },
    { from: "showToast('تم Exporter البيانات بنجاح', 'success')", to: "showToast('Données exportées avec succès', 'success')" },

    // Error Messages
    { from: "showToast('Une erreur est survenue في الاتصال', 'error')", to: "showToast('Erreur de connexion', 'error')" },
    { from: "showToast('Une erreur est survenue في جلب Détails de la commande', 'error')", to: "showToast('Erreur lors de la récupération de la commande', 'error')" },
    { from: "showToast('Une erreur est survenue في تحميل بيانات الproduit', 'error')", to: "showToast('Erreur lors du chargement du produit', 'error')" },
    { from: "showToast('Une erreur est survenue في Modifier Catégorie', 'error')", to: "showToast('Erreur lors de la modification de la catégorie', 'error')" },
    { from: "showToast('Une erreur est survenue في Supprimer Catégorie', 'error')", to: "showToast('Erreur lors de la suppression de la catégorie', 'error')" },
    { from: "showToast('Une erreur est survenue في Ajouter Catégorie', 'error')", to: "showToast(\"Erreur lors de l'ajout de la catégorie\", 'error')" },

    // Prompts and Confirms
    { from: "prompt('أدخل Nom الجديد للفئة:', cat.name)", to: "prompt('Entrez le nouveau nom de la catégorie :', cat.name)" },
    { from: "prompt('أدخل اسم Catégorie الجديدة:')", to: "prompt('Entrez le nom de la nouvelle catégorie :')" },
    { from: "confirm('Êtes-vous sûr من Supprimer هذه Catégorie؟')", to: "confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')" },
    { from: "confirm('Êtes-vous sûr من Supprimer هذا Client؟')", to: "confirm('Êtes-vous sûr de vouloir supprimer ce client ?')" },

    // General Text / Partial matches
    { from: 'Aucun فئات', to: 'Aucune catégorie' },
    { from: 'Aucun بيانات', to: 'Aucune donnée' },
    { from: 'Aucun طلبات', to: 'Aucune commande' },
    { from: 'Aucun طلبات حديثة', to: 'Aucune commande récente' },
    { from: 'Aucun produitات', to: 'Aucun produit' },
    { from: 'Une erreur est survenue في', to: 'Une erreur est survenue lors de' },
    { from: 'تحميل الproduitات', to: 'chargement des produits' },
    { from: 'فئة متجر', to: 'Catégorie boutique' },
    { from: 'الRechercher عن', to: 'Rechercher un' },
    { from: 'Ajouter une catégorie جديدة', to: 'Ajouter une nouvelle catégorie' },
    { from: 'اختر رسالة لVoirها', to: 'Sélectionnez un message pour le voir' },
    { from: 'مسؤول', to: 'Admin' },
    { from: ' دج', to: ' DA' }, // Currency

    // Hardcoded Categories mapping (for icons/colors)
    { from: "'أدوية الألم':", to: "'Douleurs':" },
    { from: "'أجهزة طبية':", to: "'Dispositifs médicaux':" },
    { from: "'مستلزمات الأطفال':", to: "'Bébé':" },
    { from: "'العناية الشخصية':", to: "'Soins personnels':" },

    // Hardcoded Messages (Dummy Data)
    { from: "name: 'أحمد محمد'", to: "name: 'Ahmed Mohamed'" },
    { from: "message: 'السلام عليكم، أريد الاستفسار عن توصيل...'", to: "message: 'Bonjour, je voudrais me renseigner sur la livraison...'" },
    { from: "name: 'سارة علي'", to: "name: 'Sara Ali'" },
    { from: "message: 'ما هي أوقات العمل لديكم؟'", to: "message: 'Quelles sont vos heures d\\'ouverture ?'" },
];

let modifiedCount = 0;

replacements.forEach(rep => {
    if (content.includes(rep.from)) {
        // Use global replace
        const regex = new RegExp(rep.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, rep.to);
        modifiedCount++;
        console.log(`Replaced: ${rep.from} -> ${rep.to}`);
    }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Finished! Performed ${modifiedCount} replacements.`);
