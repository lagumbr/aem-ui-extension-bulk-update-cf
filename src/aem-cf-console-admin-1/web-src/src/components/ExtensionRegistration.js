import { generatePath } from "react-router";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import actionWebInvoke from "../utils";

import allActions from "../config.json";

function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: extensionId, // Some unique ID for the extension used to facilitate communication between the extension and Content Fragment Console
      methods: {
        // Configure your Action Bar button here
        actionBar: {
          getButtons() {
            return [
              {
                id: "examples.action-bar.bulk-property-update", // Unique ID for the button
                label: "Bulk property update", // Button label
                icon: "OpenIn", // Button icon; get name from: https://spectrum.adobe.com/page/icons/ (Remove spaces, keep uppercase)
                // Click handler for the extension button
                onClick(selections) {
                  // Collect the selected content fragment paths
                  const selectionIds = selections.map(
                    (selection) => selection.id
                  );

                  // Create a URL that maps to the
                  const modalURL =
                    "/index.html#" +
                    generatePath(
                      "/content-fragment/:selection/bulk-property-update",
                      {
                        // Set the :selection React route parameter to an encoded, delimited list of paths of the selected content fragments
                        selection: encodeURIComponent(selectionIds.join("|")),
                      }
                    );

                  // Open the route in the extension modal using the constructed URL
                  guestConnection.host.modal.showUrl({
                    // The modal title
                    title: "Bulk property update",
                    url: modalURL,
                  });
                },
              },
            ];
          },
        },
        headerMenu: {
          async getButtons() {
            return [
              {
                id: "my.company.export-button",
                label: "Export",
                icon: "Export",
                subItems: [
                  {
                    id: "export-candidate-profiles",
                    label: "Export candidate profiles",
                    onClick: async () => {
                      guestConnection.host.toaster.display({
                        variant: "info",
                        message: "Downloading candidate profiles...",
                      });

                      // Set the HTTP headers to access the Adobe I/O runtime action
                      const headers = {
                        Authorization:
                          "Bearer " +
                          guestConnection.sharedContext.get("auth").imsToken,
                        "x-gw-ims-org-id":
                          guestConnection.sharedContext.get("auth").imsOrg,
                      };

                      console.log("headers", headers);

                      // Set the parameters to pass to the Adobe I/O Runtime action
                      const params = {
                        aemHost: `https://${guestConnection.sharedContext.get(
                          "aemHost"
                        )}`,
                        contentFragmentPath:
                          "/content/dam/elections/candidates-cf",
                      };

                      // Invoke the Adobe I/O Runtime action named `generic`. This name defined in the `ext.config.yaml` file.
                      const action = "export";

                      try {
                        guestConnection.host.progressCircle.start();
                        // Invoke Adobe I/O Runtime action with the configured headers and parameters
                        const presignedUrl = await actionWebInvoke(
                          allActions[action],
                          headers,
                          params
                        );

                        // Download the file using the returned URL
                        if (presignedUrl) {
                          console.log(`Downloading from: ${presignedUrl}`);

                          const link = document.createElement("a");
                          link.href = presignedUrl;
                          link.download = ""; // Let the browser decide the filename
                          link.target = "_blank"; // Open in new tab
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);

                          guestConnection.host.toaster.display({
                            variant: "positive",
                            message: "Your download is ready.",
                            timeout: 120000
                          });
                        } else {
                          guestConnection.host.toaster.display({
                            variant: "negative",
                            message:
                              "Error occurred while downloading candidate profiles.",
                          });

                          console.error(
                            "No download URL found in actionResponse."
                          );
                        }
                      } catch (e) {
                        guestConnection.host.toaster.display({
                          variant: "negative",
                          message:
                            "Error occurred while downloading candidate profiles.",
                        });

                        // Log and store any errors
                        console.error(e);
                      } finally {
                        guestConnection.host.progressCircle.stop();
                      }
                    },
                  },
                ],
              },
            ];
          },
        },
      },
    });
  };

  init().catch(console.error);

  return <Text>IFrame for integration with Host (AEM)...</Text>;
}

export default ExtensionRegistration;
