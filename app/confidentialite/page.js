import { entreprise } from "../../lib/entreprise";
import { PageTexte, Section, Liste } from "../../components/Texte";

export const metadata = { title: "Politique de confidentialité — NEGOCE" };

export default function Confidentialite() {
  return (
    <PageTexte titre="Politique de confidentialité" misAJour={entreprise.misAJour}>
      <Section titre="1. Qui sommes-nous ?">
        <p>
          NEGOCE est une plateforme qui permet à des commerçants de présenter leurs produits en ligne, de recevoir des
          commandes et de gérer leur boutique depuis leur téléphone.
        </p>
        <p>
          Éditeur : {entreprise.editeur}. Contact : {entreprise.email}
          {entreprise.whatsapp ? " · WhatsApp : +" + entreprise.whatsapp : ""}.
        </p>
      </Section>

      <Section titre="2. Quelles données collectons-nous ?">
        <p>Pour les commerçants :</p>
        <Liste
          elements={[
            "adresse e-mail et mot de passe (le mot de passe est chiffré : nous ne pouvons pas le lire) ;",
            "informations de la boutique : nom, ville, numéro WhatsApp, description ;",
            "produits, photos, prix et stocks ;",
            "ventes, dépenses et commandes enregistrées dans l’application.",
          ]}
        />
        <p>Pour les clients qui commandent dans une boutique :</p>
        <Liste
          elements={[
            "nom ;",
            "numéro de téléphone ;",
            "adresse ou quartier de livraison, ville et précisions éventuelles ;",
            "contenu de la commande (produits, quantités, taille, couleur, total).",
          ]}
        />
      </Section>

      <Section titre="3. Pourquoi utilisons-nous ces données ?">
        <Liste
          elements={[
            "fournir le service et faire fonctionner les boutiques ;",
            "permettre au commerçant de traiter, confirmer et livrer les commandes, et de contacter le client ;",
            "sécuriser la plateforme et prévenir les abus.",
          ]}
        />
        <p>Nous ne vendons pas vos données et nous ne les utilisons pas pour de la publicité.</p>
      </Section>

      <Section titre="4. Qui peut voir vos données ?">
        <Liste
          elements={[
            "le commerçant de la boutique où une commande est passée voit les informations du client qui a commandé ;",
            "les données d’un commerçant ne sont visibles que depuis son propre compte ;",
            "nos prestataires techniques : Supabase (base de données et fichiers) et Vercel (hébergement du site), qui traitent les données uniquement pour faire fonctionner le service ;",
            "si un client choisit d’envoyer sa commande par WhatsApp, le message transite par WhatsApp, selon ses propres règles.",
          ]}
        />
      </Section>

      <Section titre="5. Où sont stockées les données ?">
        <p>
          Les données sont hébergées chez des prestataires situés hors de {entreprise.pays}, avec des serveurs en
          Europe. Nous veillons à choisir des prestataires qui protègent les données de manière adéquate.
        </p>
      </Section>

      <Section titre="6. Combien de temps les conservons-nous ?">
        <p>
          Les données d’un compte sont conservées tant que le compte existe. Les commandes sont conservées pour le suivi
          de la boutique. Sur demande, nous supprimons les données dans un délai raisonnable, sauf obligation légale de
          les conserver.
        </p>
      </Section>

      <Section titre="7. Vos droits">
        <p>
          Vous pouvez demander l’accès à vos données, leur correction, leur suppression, ou vous opposer à leur
          utilisation. Écrivez-nous à {entreprise.email}. Un client peut aussi s’adresser directement à la boutique
          auprès de laquelle il a commandé.
        </p>
        <p>
          Vous pouvez également saisir l’autorité de protection des données personnelles de {entreprise.pays}, l’ARTCI
          (Autorité de régulation des télécommunications/TIC de Côte d’Ivoire).
        </p>
      </Section>

      <Section titre="8. Sécurité">
        <p>
          Les échanges sont chiffrés (HTTPS), l’accès aux données est limité à chaque boutique et les mots de passe sont
          chiffrés. Aucun système n’étant parfait, nous ne pouvons pas garantir une sécurité absolue.
        </p>
      </Section>

      <Section titre="9. Cookies">
        <p>
          NEGOCE utilise uniquement des cookies nécessaires au fonctionnement : un cookie de connexion pour les
          commerçants, et un cookie temporaire (6 heures) qui permet d’afficher le récapitulatif d’une commande juste
          après l’avoir passée. Nous n’utilisons aucun cookie de publicité ni de suivi.
        </p>
      </Section>

      <Section titre="10. Modifications">
        <p>
          Cette politique peut évoluer. La date de dernière mise à jour est indiquée en haut de cette page.
        </p>
      </Section>
    </PageTexte>
  );
}
