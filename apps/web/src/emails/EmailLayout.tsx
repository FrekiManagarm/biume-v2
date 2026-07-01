import { Body, Container, Head, Html, Img, Link, Preview, Section, Tailwind, Text } from "@react-email/components"
import * as React from "react"

export const EmailLayout = ({ preview, children }: React.PropsWithChildren<{ preview?: string }>) => {
  return (
    <Tailwind>
      <Html>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="x-apple-disable-message-reformatting" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
          <meta name="x-mailer-avatar" content="https://i.imgur.com/Imdhydj.png" />
          <style
            dangerouslySetInnerHTML={{
              __html: `
              /* Responsive breakpoints optimisés */
              @media only screen and (max-width: 768px) {
                .tablet-padding { padding-left: 16px !important; padding-right: 16px !important; }
                .tablet-container { max-width: 100% !important; width: 100% !important; }
                .tablet-content { padding: 20px !important; }
                .tablet-header { padding: 16px 0 !important; }
                .tablet-footer { margin-top: 20px !important; }
                .tablet-logo { width: 44px !important; height: auto !important; }
                .tablet-text { font-size: 14px !important; line-height: 1.5 !important; }
                .tablet-margin { margin-top: 8px !important; margin-bottom: 8px !important; }
                .tablet-social { width: 22px !important; height: 22px !important; }
              }
              
              @media only screen and (max-width: 600px) {
                .mobile-padding { padding-left: 12px !important; padding-right: 12px !important; }
                .mobile-container { max-width: 100% !important; width: 100% !important; }
                .mobile-content { padding: 16px !important; margin: 0 !important; }
                .mobile-social { width: 20px !important; height: 20px !important; }
                .mobile-text { font-size: 13px !important; line-height: 1.5 !important; }
                .mobile-margin { margin-top: 6px !important; margin-bottom: 6px !important; }
                .mobile-header { padding: 12px 0 !important; }
                .mobile-footer { margin-top: 16px !important; }
                .mobile-logo { width: 40px !important; height: auto !important; }
                .mobile-title { font-size: 18px !important; line-height: 1.4 !important; }
                .mobile-subtitle { font-size: 14px !important; line-height: 1.4 !important; }
                .mobile-section { margin-bottom: 16px !important; }
                .mobile-button { padding: 12px 20px !important; font-size: 14px !important; }
                .mobile-gap { gap: 8px !important; }
              }
              
              @media only screen and (max-width: 480px) {
                .mobile-padding { padding-left: 8px !important; padding-right: 8px !important; }
                .mobile-content { padding: 12px !important; }
                .mobile-text { font-size: 12px !important; }
                .mobile-title { font-size: 16px !important; }
                .mobile-subtitle { font-size: 13px !important; }
                .mobile-button { padding: 10px 16px !important; font-size: 13px !important; }
                .mobile-header { padding: 8px 0 !important; }
                .mobile-footer { margin-top: 12px !important; }
                .mobile-logo { width: 36px !important; height: auto !important; }
                .mobile-social { width: 18px !important; height: 18px !important; }
                .mobile-gap { gap: 6px !important; }
              }
              
              @media only screen and (max-width: 360px) {
                .mobile-padding { padding-left: 6px !important; padding-right: 6px !important; }
                .mobile-content { padding: 10px !important; }
                .mobile-text { font-size: 11px !important; }
                .mobile-title { font-size: 15px !important; }
                .mobile-subtitle { font-size: 12px !important; }
                .mobile-header { padding: 6px 0 !important; }
                .mobile-footer { margin-top: 10px !important; }
                .mobile-logo { width: 32px !important; height: auto !important; }
                .mobile-social { width: 16px !important; height: 16px !important; }
                .mobile-gap { gap: 4px !important; }
              }
              
              /* Assurer la compatibilité avec tous les clients email */
              table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
              img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
              
              /* Amélioration de la lisibilité */
              .email-body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
              .email-link { color: #4f46e5; text-decoration: none; }
              .email-link:hover { color: #3730a3; }
              
              /* Optimisations pour les petits écrans */
              .email-container { 
                max-width: 600px !important; 
                margin: 0 auto !important; 
                padding: 0 20px !important; 
              }
              
              /* Amélioration des espacements */
              .content-spacing { 
                padding: 24px !important; 
                margin: 0 !important; 
              }
              
              /* Footer optimisé */
              .footer-spacing { 
                margin-top: 24px !important; 
                padding-top: 16px !important; 
              }
            `,
            }}
          />
        </Head>
        {preview && <Preview>{preview}</Preview>}
        <Body className="bg-gray-50 my-auto mx-auto font-sans email-body">
          {/* Top Banner */}
          <Section className="w-full bg-white border-b border-gray-200 py-8 mobile-header tablet-header mobile-padding tablet-padding">
            <Container className="mx-auto text-center mobile-container tablet-container">
              <Img
                src="https://i.imgur.com/Imdhydj.png"
                width="48"
                height="auto"
                alt="Biume"
                className="mx-auto mobile-logo tablet-logo"
              />
            </Container>
          </Section>

          {/* Main Content */}
          <Container className="mx-auto px-6 py-8 max-w-[600px] mobile-padding tablet-padding mobile-container tablet-container email-container">
            {/* Content Area */}
            <Section className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm mobile-content tablet-content content-spacing">
              {children}
            </Section>

            {/* Footer */}
            <Section className="text-center mt-10 mobile-footer tablet-footer footer-spacing">
              <Text className="text-sm text-gray-600 mb-6 mobile-text tablet-text mobile-margin tablet-margin">
                Suivez-nous sur les réseaux sociaux
              </Text>

              {/* Social Links - Modern Icons */}
              <Section className="mb-8 flex justify-center space-x-6 gap-3 mobile-gap">
                <Link
                  href="https://www.linkedin.com/company/biume"
                  className="text-gray-400 hover:text-indigo-600 transition-colors inline-block p-2"
                >
                  <svg
                    width="24"
                    height="24"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid"
                    viewBox="0 0 256 256"
                    className="mobile-social tablet-social"
                  >
                    <path
                      d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"
                      fill="#0A66C2"
                    />
                  </svg>
                </Link>
                <Link
                  href="https://instagram.com/biume_app"
                  target="_blank"
                  className="text-gray-400 hover:text-indigo-600 transition-colors inline-block p-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    preserveAspectRatio="xMidYMid"
                    viewBox="0 0 256 256"
                    className="mobile-social tablet-social"
                  >
                    <path
                      fill="#000000"
                      d="M128 23.064c34.177 0 38.225.13 51.722.745 12.48.57 19.258 2.655 23.769 4.408 5.974 2.322 10.238 5.096 14.717 9.575 4.48 4.479 7.253 8.743 9.575 14.717 1.753 4.511 3.838 11.289 4.408 23.768.615 13.498.745 17.546.745 51.723 0 34.178-.13 38.226-.745 51.723-.57 12.48-2.655 19.257-4.408 23.768-2.322 5.974-5.096 10.239-9.575 14.718-4.479 4.479-8.743 7.253-14.717 9.574-4.511 1.753-11.289 3.839-23.769 4.408-13.495.616-17.543.746-51.722.746-34.18 0-38.228-.13-51.723-.746-12.48-.57-19.257-2.655-23.768-4.408-5.974-2.321-10.239-5.095-14.718-9.574-4.479-4.48-7.253-8.744-9.574-14.718-1.753-4.51-3.839-11.288-4.408-23.768-.616-13.497-.746-17.545-.746-51.723 0-34.177.13-38.225.746-51.722.57-12.48 2.655-19.258 4.408-23.769 2.321-5.974 5.095-10.238 9.574-14.717 4.48-4.48 8.744-7.253 14.718-9.575 4.51-1.753 11.288-3.838 23.768-4.408 13.497-.615 17.545-.745 51.723-.745M128 0C93.237 0 88.878.147 75.226.77c-13.625.622-22.93 2.786-31.071 5.95-8.418 3.271-15.556 7.648-22.672 14.764C14.367 28.6 9.991 35.738 6.72 44.155 3.555 52.297 1.392 61.602.77 75.226.147 88.878 0 93.237 0 128c0 34.763.147 39.122.77 52.774.622 13.625 2.785 22.93 5.95 31.071 3.27 8.417 7.647 15.556 14.763 22.672 7.116 7.116 14.254 11.492 22.672 14.763 8.142 3.165 17.446 5.328 31.07 5.95 13.653.623 18.012.77 52.775.77s39.122-.147 52.774-.77c13.624-.622 22.929-2.785 31.07-5.95 8.418-3.27 15.556-7.647 22.672-14.763 7.116-7.116 11.493-14.254 14.764-22.672 3.164-8.142 5.328-17.446 5.95-31.07.623-13.653.77-18.012.77-52.775s-.147-39.122-.77-52.774c-.622-13.624-2.786-22.929-5.95-31.07-3.271-8.418-7.648-15.556-14.764-22.672C227.4 14.368 220.262 9.99 211.845 6.72c-8.142-3.164-17.447-5.328-31.071-5.95C167.122.147 162.763 0 128 0Zm0 62.27C91.698 62.27 62.27 91.7 62.27 128c0 36.302 29.428 65.73 65.73 65.73 36.301 0 65.73-29.428 65.73-65.73 0-36.301-29.429-65.73-65.73-65.73Zm0 108.397c-23.564 0-42.667-19.103-42.667-42.667S104.436 85.333 128 85.333s42.667 19.103 42.667 42.667-19.103 42.667-42.667 42.667Zm83.686-110.994c0 8.484-6.876 15.36-15.36 15.36-8.483 0-15.36-6.876-15.36-15.36 0-8.483 6.877-15.36 15.36-15.36 8.484 0 15.36 6.877 15.36 15.36Z"
                    />
                  </svg>
                </Link>
              </Section>

              <Text className="text-sm text-gray-500 mb-4 mobile-text tablet-text mobile-margin tablet-margin">
                Transformez la gestion de votre activité animale avec Biume
              </Text>

              <div className="text-sm text-gray-400 leading-relaxed mobile-text tablet-text">
                <Text className="m-0 mobile-margin tablet-margin">Biume SAS</Text>
              </div>

              <Section className="mt-4 mobile-margin tablet-margin">
                <Link
                  href="mailto:contact@biume.com"
                  className="text-sm text-indigo-600 hover:text-indigo-700 no-underline mobile-text tablet-text email-link"
                >
                  contact@biume.com
                </Link>
              </Section>

              <Text className="text-xs text-gray-400 mt-6 mobile-text tablet-text mobile-margin tablet-margin">
                © {new Date().getFullYear()} Biume. Tous droits réservés.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}
