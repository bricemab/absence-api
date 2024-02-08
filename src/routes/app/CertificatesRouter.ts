import { Router } from "express";
import AclManager from "../../permissions/AclManager";
import { Permissions } from "../../permissions/permissions";
import RequestManager from "../../modules/Global/RequestManager";
import { ApplicationRequest, UserSession } from "../../utils/Types";
import { AuthenticationErrors, UserErrors } from "../../modules/Global/BackendErrors";
import CertificatesManager from "../../modules/certificates/CertificatesManager";

const CertificatesRouter = Router();

CertificatesRouter.post(
  "/load",
  AclManager.hasPermissionRoute(Permissions.specialState.userLoggedIn),
  RequestManager.asyncResolver(
    async (
        request: ApplicationRequest<{
          token: string;
          data: {};
        }>,
        response: Response
    ) => {
      if (!request.isLogged) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_IN,
            message: "You must be logged in"
          }
        });
      }
      const user = request.tokenDecryptedData!.user as UserSession;
      const certificateResponse = await CertificatesManager.findCurrentCertificateByUserKey(user.key);
      if (!certificateResponse.success && !certificateResponse.data) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: UserErrors.NOT_CERTIFICATE_PENDING,
            message: "No certificate found for this user"
          }
        }, 200);
      }
      const { certificate } = certificateResponse.data!;

      RequestManager.sendResponse(response, {
        success: true,
        data: {
          certificate: certificate.toJSON()
        }
      });
    }
  )
)

export default CertificatesRouter;
