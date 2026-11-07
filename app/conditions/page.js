import { entreprise } from "../../lib/entreprise";
import { PageTexte, Section, Liste } from "../../components/Texte";

export const metadata = { title: "Conditions d’utilisation — NEGOCE" };

export default function Conditions() {
  return (
    <PageTexte titre="Conditions d’utilisation" misAJour={entreprise.misAJour}>
      <Section titre="1. Objet">
        <p>
          NEGOCE est une plateforme qui permet à des commerçants de créer une boutique en ligne, de recevoir des
          commandes et de gérer leur activité. En utilisant NEGOCE, vous acceptez les présentes conditions.
        </p>
        <p>
          Éditeur : {entreprise.editeur}. Contact : {entreprise.email}.
        </p>
      </Section>

      <Section titre="2. Compte commerçant">
        <p>
          Le commerçant fournit des informations exactes, garde son mot de passe confidentiel et reste responsable de
          l’activité réalisée depuis son compte.
        </p>
      </Section>

      <Section titre="3. Produits et contenus">
        <p>
          Le commerçant est seul responsable des produits qu’il propose, de leurs descriptions, de leurs prix et de ses
          photos. Il garantit avoir le droit d’utiliser les photos et les textes qu’il publie.
        </p>
        <p>Sont interdits :</p>
        <Liste
          elements={[
            "les produits illégaux, contrefaits ou dangereux ;",
            "les contenus trompeurs, injurieux ou discriminatoires ;",
            "toute utilisation de NEGOCE pour tromper des clients.",
          ]}
        />
        <p>
          NEGOCE peut masquer un contenu ou suspendre un compte qui ne respecte pas ces règles.
        </p>
      </Section>

      <Section titre="4. Commandes et paiement">
        <p>
          La vente est conclue directement entre le client et le commerçant. NEGOCE fournit l’outil, mais n’est ni le
          vendeur, ni le livreur, et n’est pas partie à la vente.
        </p>
        <p>
          Pour le moment, le paiement se fait à la livraison. NEGOCE ne propose pas de paiement en ligne. Le commerçant
          confirme ou refuse chaque commande et s’engage à respecter les prix et les délais annoncés.
        </p>
      </Section>

      <Section titre="5. WhatsApp et services tiers">
        <p>
          Les boutons WhatsApp ouvrent une conversation avec un message prérempli. NEGOCE n’est pas affilié à WhatsApp
          ni à Meta, et l’usage de WhatsApp reste soumis à ses propres conditions.
        </p>
      </Section>

      <Section titre="6. Disponibilité et évolutions">
        <p>
          Le service est fourni en l’état et peut évoluer. Nous faisons le maximum pour qu’il soit disponible, sans
          pouvoir garantir l’absence d’interruption. Les fonctionnalités et les tarifs pourront changer, avec une
          information préalable aux commerçants.
        </p>
      </Section>

      <Section titre="7. Responsabilité">
        <p>
          Dans la limite de ce que permet la loi, NEGOCE n’est pas responsable des litiges entre commerçants et clients,
          de la qualité ou de la livraison des produits, ni des pertes indirectes liées à l’utilisation du service.
        </p>
      </Section>

      <Section titre="8. Fin du compte">
        <p>
          Le commerçant peut demander la suppression de son compte à tout moment en écrivant à {entreprise.email}.
          NEGOCE peut suspendre ou supprimer un compte en cas de non-respect de ces conditions.
        </p>
      </Section>

      <Section titre="9. Droit applicable">
        <p>
          Les présentes conditions sont soumises au droit applicable en {entreprise.pays}. Vos données personnelles sont
          traitées conformément à notre politique de confidentialité.
        </p>
      </Section>
    </PageTexte>
  );
}
