export function handleErrorMessagesFactory(
  setter: React.Dispatch<React.SetStateAction<string>>
) {
  return function handleErrorMessages(errorOptions: {
    err?: Error;
    customMessage?: string;
  }) {
    const { err, customMessage } = errorOptions;
    if (err) {
      // @ts-ignore
      if (err.data && err.data.message) {
        // @ts-ignore
        console.log(err.data.message);
        if (
          // @ts-ignore
          err.data.message.includes("execution reverted:")
        ) {
          // @ts-ignore
          setter(err.data.message.replace("execution reverted:", ""));
        }
        if (
          // @ts-ignore
          err.data.message.includes("Insufficient ticket balance to redeem")
        ) {
          setter(
            // @ts-ignore
            (err.data.message = "Insufficient ticket balance to redeem")
          );
        } else {
          // @ts-ignore
          setter(err.data.message);
        }
      } else {
        if (
          // @ts-ignore
          err.message.includes("Must own a pot token to plant")
        ) {
          setter("Must own an Empty Pot to Plant");
        } else if (err.message.includes("NFTTicket: minting is not active")) {
          setter("Minting is not active");
        } else if (err.message.includes("NFTTicket: Redeeming is not active")) {
          setter("Redeeming is not active");
        } else if (err.message.includes("NFTTicket: Redeem Period has ended")) {
          setter("Redeem period has ended");
        } else if (err.message.includes("PaperPot: minting paused")) {
          setter("Minting has been paused");
        } else if (err.message.includes("PaperPot: invalid ticket tokenId")) {
          setter("Minting has been paused - #1005");
        } else {
          setter(err.message);
        }
      }
      console.log(err);
    } else if (customMessage) {
      setter(customMessage);
    }
  };
}
