

const fetch = require("node-fetch");
const { Core } = require("@adobe/aio-sdk");
const {
  errorResponse,
  getBearerToken,
  stringParameters,
  checkMissingRequestInputs,
} = require("../utils");
const { fetchAllContentFragments, processContentFragments } = require("./helper");

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

  try {
    // 'info' is the default level if not set
    logger.info("Calling the main action export");

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params));

    // check for missing request input parameters and headers
    const requiredParams = ["contentFragmentPath","aemHost"];
    const requiredHeaders = ["Authorization"];
    const errorMessage = checkMissingRequestInputs(
      params,
      requiredParams,
      requiredHeaders
    );
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger);
    }

    // Extract the user Bearer token from the Authorization header used to authenticate the request to AEM
    const accessToken = getBearerToken(params);

    //1 query all content fragments with specific model
    const allContentFragments = await fetchAllContentFragments(
      accessToken,
      params.contentFragmentPath,
      params.aemHost,
      logger
    );

    const formattedContentFragments = processContentFragments(allContentFragments);

    logger.info(`formattedContentFragments first element: ${JSON.stringify(formattedContentFragments[0])}`);

    //2 create a csv file in aio storage

    //3 return the presigned URL to the csv file

    const response = {
      statusCode: 200,
      body: formattedContentFragments,
    };


    return response;
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, "server error", logger);
  }
}

exports.main = main;
