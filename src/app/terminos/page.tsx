import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TerminosPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Términos y Condiciones</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-4">
          <p className="text-muted-foreground">Última actualización: Septiembre 2026</p>

          <h2 className="text-lg font-semibold">1. Aceptación de los términos</h2>
          <p>
            Al acceder y utilizar Dchiripa Store, aceptas estos términos y condiciones en su totalidad.
            Si no estás de acuerdo con alguno de estos términos, no debes utilizar nuestro servicio.
          </p>

          <h2 className="text-lg font-semibold">2. Descripción del servicio</h2>
          <p>
            Dchiripa Store es una plataforma de marketplace digital que ofrece archivos de diseño editables
            (PSD, AI, Figma, plantillas, mockups, etc.) para compra y descarga. Ofrecemos compras individuales
            y suscripciones con acceso ilimitado.
          </p>

          <h2 className="text-lg font-semibold">3. Cuentas de usuario</h2>
          <p>
            Para acceder a ciertas funcionalidades, debes crear una cuenta. Eres responsable de mantener
            la confidencialidad de tu contraseña y de todas las actividades que ocurran en tu cuenta.
          </p>

          <h2 className="text-lg font-semibold">4. Compras y pagos</h2>
          <p>
            Los precios están mostrados en euros (EUR). Los pagos se procesan a través de Stripe.
            Las suscripciones se renuevan automáticamente al final de cada período de facturación.
            Puedes cancelar tu suscripción en cualquier momento desde tu panel de usuario.
          </p>

          <h2 className="text-lg font-semibold">5. Licencia de uso</h2>
          <p>
            Al comprar un archivo, obtienes una licencia de uso comercial que te permite utilizar el
            archivo en proyectos personales y comerciales. No puedes redistribuir, revender o compartir
            los archivos descargados.
          </p>

          <h2 className="text-lg font-semibold">6. Política de reembolso</h2>
          <p>
            Debido a la naturaleza digital de los productos, no ofrecemos reembolsos una vez que el
            archivo haya sido descargado. Si experimentas algún problema con un archivo, contáctanos
            para que podamos ayudarte.
          </p>

          <h2 className="text-lg font-semibold">7. Propiedad intelectual</h2>
          <p>
            Todo el contenido disponible en Dchiripa Store es propiedad de sus respectivos creadores.
            Los derechos de autor y propiedad intelectual están protegidos por las leyes aplicables.
          </p>

          <h2 className="text-lg font-semibold">8. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento.
            Las modificaciones entrarán en vigor inmediatamente después de su publicación.
          </p>

          <h2 className="text-lg font-semibold">9. Contacto</h2>
          <p>
            Si tienes preguntas sobre estos términos, contáctanos a través de nuestro
            canal de soporte.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
