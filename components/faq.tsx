"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQ() {
  return (
    <div className="max-w-3xl mx-auto">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Comment fonctionne VYbzzZ?</AccordionTrigger>
          <AccordionContent>
            VYbzzZ est une plateforme de streaming de concerts en direct. Achetez un ticket et regardez vos artistes préférés en HD depuis n&apos;importe où.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Quelle est la différence entre e-ticket et ticket physique?</AccordionTrigger>
          <AccordionContent>
            Les e-tickets sont 50-70% moins chers et vous permettent de regarder le concert en streaming. Les tickets physiques sont au prix plein.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Puis-je regarder le concert après qu&apos;il soit terminé?</AccordionTrigger>
          <AccordionContent>
            Actuellement, les concerts sont uniquement disponibles en direct. La fonctionnalité de replay sera disponible prochainement.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
