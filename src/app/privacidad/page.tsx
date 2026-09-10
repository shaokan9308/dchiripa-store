import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacidadPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Política de Privacidad</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-4">
          <p className="text-muted-foreground">Última actualización: Septiembre 2026</p>

          <h2 className="text-lg font-semibold">1. Información que recopilamos</h2>
          <p>
            Recopilamos información que nos proporcionas directamente, como tu nombre, email y
            información de pago cuando creas una cuenta o realizas una compra. También recopilamos
            datos de uso automáticamente, como tu dirección IP, tipo de navegador y páginas visitadas.
          </p>

          <h2 className="text-lg font-semibold">2. Uso de la información</h2>
          <p>Utilizamos tu información para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Procesar tus compras y entregarte los productos digitales</li>
            <li>Gestionar tu cuenta y suscripción</li>
            <li>Enviarte actualizaciones sobre tu cuenta y pedidos</li>
            <li>Mejorar nuestro servicio y experiencia de usuario</li>
            <li>Prevenir fraude y garantizar la seguridad</li>
          </ul>

          <h2 className="text-lg font-semibold">3. Compartir información</h2>
          <p>
            No vendemos tu información personal. Compartimos datos solo con terceros necesarios
            para operar el servicio, como Stripe (procesamiento de pagos) y proveedores de
            hosting (almmacenamiento de archivos).
          </p>

          <h2 className="text-lg font-semibold">4. Cookies</h2>
          <p>
            Utilizamos cookies esenciales para el funcionamiento del sitio, incluyendo cookies
            de autenticación y preferencias. No utilizamos cookies de rastreo publicitario.
          </p>

          <h2 className="text-lg font-semibold">5. Seguridad</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información
            personal contra acceso no autorizado, alteración, divulgación o destrucción.
          </p>

          <h2 className="text-lg font-semibold">6. Retención de datos</h2>
          <p>
            Conservamos tu información personal mientras tu cuenta esté activa o según sea necesario
            para proporcionarte servicios. Puedes solicitar la eliminación de tu cuenta en cualquier momento.
          </p>

          <h2 className="text-lg font-semibold">7. Tus derechos</h2>
          <p>Tienes derecho a:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acceder a tu información personal</li>
            <li>Corregir información inexacta</li>
            <li>Solicitar la eliminación de tu cuenta</li>
            <li>Oponerte al procesamiento de tus datos</li>
            <li>Solicitar la portabilidad de tus datos</li>
          </ul>

          <h2 className="text-lg font-semibold">8. Cambios en esta política</h2>
          <p>
            Podemos actualizar esta política de privacidad periódicamente. Te notificaremos de
            cambios significativos a través de nuestro sitio web o por email.
          </p>

          <h2 className="text-lg font-semibold">9. Contacto</h2>
          <p>
            Si tienes preguntas sobre esta política de privacidad o sobre el tratamiento de tus
            datos personales, contáctanos a través de nuestro canal de soporte.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
