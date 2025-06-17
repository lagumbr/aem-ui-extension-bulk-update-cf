/**
 * Fetch all content fragments.
 * @param aemAccessToken - The AEM IMS access token.
 * @returns A list of content fragments.
 */
export async function fetchAllContentFragments(
  aemAccessToken,
  contentFragmentPath,
  aemHost,
  logger
) {
  logger.info(
    `Fetching all content fragments in path ${contentFragmentPath}...`
  );

  let allItems = [];
  let cursor = undefined;
  let hasMore = true;

  while (hasMore) {
    const query = new URLSearchParams({
      ...(cursor ? { cursor } : {}),
      limit: "50",
      path: contentFragmentPath,
      references: "direct",
    }).toString();

    const response = await fetch(
      `${aemHost}/adobe/sites/cf/fragments?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${aemAccessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch content fragments: ${response.statusText}`
      );
    }

    const data = await response.json();

    allItems = allItems.concat(data.items || []);

    // Update cursor and decide whether to continue
    cursor = data.cursor;
    hasMore = !!cursor;

    logger.info(
      `Fetched ${data.items.length} items, total so far: ${allItems.length}`
    );
  }

  logger.info(`Finished fetching. Total content fragments: ${allItems.length}`);

  return allItems;
}

/**
 * Processes content fragments into candidate data.
 * @param listItems - The content fragments response.
 * @returns A list of candidate data.
 */
export function processContentFragments(
  listItems
) {
  return listItems
    .filter((z) => z.model.name == "Candidate Profile")
    .map((c) => {
      const aemCandidateContentFormId = c.path.split("/").pop() || "";

      const email = getFieldValue(c.fields, "email");
      const position = getFieldValue(c.fields, "position");
      const location = getFieldValue(c.fields, "location");
      const status = getFieldValue(c.fields, "status");

      return {
        email,
        position,
        location,
        aemCandidateContentFormId,
        status,
      };
    });
}

/**
 * Gets the value of a specific field from fragment data.
 * @param fragmentData - The fragment data.
 * @param fieldname - The name of the field to retrieve.
 * @returns The field value.
 */
export function getFieldValue(
  fragmentDataFields,
  fieldname
) {
  return fragmentDataFields.find((z) => z.name == fieldname)?.values[0] || "";
}