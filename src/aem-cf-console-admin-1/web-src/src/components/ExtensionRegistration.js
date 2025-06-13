/*
 * <license header>
 */


import { generatePath } from "react-router";

import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";

function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        actionBar: {
          getButtons() {
            return [
              // YOUR ACTION BAR BUTTONS CODE SHOULD BE HERE
              {
                'id': 'bulk-property-update',
                'label': 'Bulk property update',
                'icon': 'PublishCheck',
                onClick(selections) {
                  const modalURL = "/index.html#" + generatePath("/content-fragment/:fragmentId/bulk-property-update-modal", {
                    fragmentId: encodeURIComponent(selections[0].id),
                  });
                  console.log("Modal URL: ", modalURL);

                  guestConnection.host.modal.showUrl({
                    title: "Bulk property update",
                    url: modalURL,
                  });
                },
              },
            ];
          },
        },
      },
    });
  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (AEM)...</Text>
}

export default ExtensionRegistration;
