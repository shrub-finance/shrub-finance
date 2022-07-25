describe("Home Page Test", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
    cy.get(".App")
      .children()
      .first()
      .children()
      .first()
      .children()
      .first()
      .as("topNav");
  });

  it("Left side Navigation", () => {
    cy.get("@topNav")
      .should("have.class", "css-lygqz2")
      .children()
      .should("have.length", 2);
    cy.get("@topNav").children().first().as("leftSideNav");
    cy.get("@leftSideNav").children().eq(1).as("navigationChildren");
    cy.get("@navigationChildren")
      .children()
      .first()
      .should("have.text", "Shrubfolio");
    cy.get("@navigationChildren")
      .children()
      .eq(1)
      .should("have.text", "Options");
    cy.get("@navigationChildren").children().eq(2).should("have.text", "Docs");
    cy.get("@navigationChildren")
      .children()
      .eq(3)
      .should("have.text", "Report Issues");
  });

  it("Right side Navigation", () => {
    cy.get("@topNav")
      .children()
      .eq(1)
      .should("have.class", "css-70qvj9")
      .as("rightSideNav");
    cy.get("@rightSideNav").children().as("navigationChildren");
    cy.get("@navigationChildren")
      .first()
      .should("have.class", "chakra-button")
      .and("have.text", "Shrub Faucet");
    cy.get("@navigationChildren")
      .eq(2)
      .children()
      .first()
      .should("have.class", "chakra-button")
      .and("have.class", "css-1md38k1")
      .and("have.text", " Connect Wallet");
  });

  it("metamask extension not installed", () => {
    cy.get(".css-jipda8")
      .find("button")
      .should("have.text", " Connect Wallet")
      .click();
    cy.get(".chakra-portal");
    cy.get(".chakra-portal")
      .children()
      .eq(3)
      .children()
      .first()
      .children()
      .first()
      .children()
      .eq(2)
      .children()
      .first()
      .children()
      .as("connectWalletModal");
    cy.get("@connectWalletModal")
      .first()
      .click()
      .then(() => {
        cy.get(".chakra-portal")
          .children()
          .eq(3)
          .children()
          .first()
          .children()
          .first()
          .children()
          .eq(2)
          .children()
          .first()
          .children()
          .as("connectWalletModal2");
        cy.get("@connectWalletModal2")
          .children()
          .first()
          .should("have.class", "chakra-alert")
          .and("have.class", "css-1mzkjkd")
          .and(
            "have.text",
            "You can use MetaMask by installing the browser extension or WalletConnect."
          );
        cy.get("@connectWalletModal2")
          .children()
          .eq(1)
          .click()
          .then(() => {
            cy.get(".chakra-portal").should("not.be.visible");
          });
      });
    cy.get(".chakra-portal")
      .children()
      .eq(3)
      .children()
      .first()
      .children()
      .first()
      .children()
      .eq(1)
      .click();
    cy.get(".css-jipda8")
      .find("button")
      .should("have.text", " Install MetaMask");
  });

  it("Wallet connect", () => {
    cy.get(".css-jipda8")
      .find("button")
      .should("have.text", " Connect Wallet")
      .click();
    cy.get(".chakra-portal")
      .children()
      .eq(3)
      .children()
      .first()
      .children()
      .first()
      .children()
      .eq(2)
      .children()
      .first()
      .children()
      .as("connectWalletModal");
    cy.get("@connectWalletModal")
      .eq(1)
      .click()
      .then(() => {
        cy.get("#walletconnect-wrapper")
          .children()
          .first()
          .children()
          .first()
          .should("have.class", "walletconnect-modal__base")
          .as("walletconnect-wrapper")
          .children()
          .should("have.length", 3);
        cy.get("@walletconnect-wrapper")
          .children()
          .first()
          .find("p")
          .should("have.text", "WalletConnect");
        cy.get("@walletconnect-wrapper")
          .children()
          .eq(1)
          .should("have.class", "walletconnect-modal__mobile__toggle")
          .children()
          .eq(1)
          .should("have.text", "QR Code");
        cy.get("@walletconnect-wrapper")
          .children()
          .eq(1)
          .should("have.class", "walletconnect-modal__mobile__toggle")
          .children()
          .eq(2)
          .should("have.text", "Desktop")
          .click()
          .then(() => {
            cy.get("#walletconnect-wrapper")
              .children()
              .first()
              .children()
              .first()
              .should("have.class", "walletconnect-modal__base")
              .as("walletconnect-wrapper")
              .children()
              .should("have.length", 3);
            cy.get("@walletconnect-wrapper")
              .children()
              .should("have.length", 3);
            cy.get("@walletconnect-wrapper").children().first();
            cy.get("@walletconnect-wrapper").children().eq(1);
            cy.get("@walletconnect-wrapper")
              .children()
              .eq(2)
              .children()
              .first()
              .children()
              .first()
              .should("have.text", "Choose your preferred wallet");
            cy.get("@walletconnect-wrapper")
              .children()
              .eq(2)
              .children()
              .first()
              .children()
              .eq(2)
              .should(
                "have.class",
                "walletconnect-connect__buttons__wrapper__wrap"
              )
              .children()
              .should("have.length", 12);
            cy.get("@walletconnect-wrapper")
              .children()
              .first()
              .children()
              .eq(2)
              .click()
              .then(() => {
                cy.get(".chakra-portal")
                  .children()
                  .eq(3)
                  .children()
                  .first()
                  .children()
                  .first()
                  .children()
                  .eq(2)
                  .children()
                  .first()
                  .children()
                  .first()
                  .children()
                  .first()
                  .should("have.class", "chakra-alert")
                  .and("have.class", "css-1mzkjkd")
                  .and(
                    "have.text",
                    "Please authorize this website to access your Ethereum account."
                  );
                cy.get(".chakra-portal")
                  .children()
                  .eq(3)
                  .children()
                  .first()
                  .children()
                  .first()
                  .children()
                  .eq(1)
                  .click();
                cy.get(".css-jipda8")
                  .find("button")
                  .should("have.text", " Authorize Access");
              });
          });
      });
  });

  it("Coin Base wallet", () => {
    cy.get(".css-jipda8")
      .find("button")
      .should("have.text", " Connect Wallet")
      .click();
    cy.get(".chakra-portal")
      .children()
      .eq(3)
      .children()
      .first()
      .children()
      .first()
      .children()
      .eq(2)
      .children()
      .first()
      .children()
      .as("connectWalletModal");
    cy.get("@connectWalletModal")
      .eq(2)
      .click()
      .then(() => {
        cy.get(".-walletlink-css-reset")
          .children()
          .first()
          .children()
          .first()
          .children()
          .eq(2)
          .children()
          .first()
          .should("have.class", "-walletlink-extension-dialog-box")
          .as("walletBody");
        cy.get("@walletBody")
          .children()
          .first()
          .should("have.class", "-walletlink-extension-dialog-box-top")
          .children()
          .first()
          .find("h2")
          .should("have.text", "Try the Coinbase Wallet extension");
        cy.get("@walletBody")
          .children()
          .first()
          .children()
          .eq(1)
          .should(
            "have.class",
            "-walletlink-extension-dialog-box-top-info-region"
          )
          .as("rightChildren");
        cy.get("@rightChildren")
          .children()
          .first()
          .should("have.text", "Connect to crypto apps with one click");
        cy.get("@rightChildren")
          .children()
          .eq(1)
          .should("have.text", "Your private key is stored securely");
        cy.get("@rightChildren")
          .children()
          .eq(2)
          .should("have.text", "Works with Ethereum, Polygon, and more");
        cy.get("@walletBody")
          .children()
          .eq(2)
          .click()
          .then(() => {
            cy.get(".chakra-portal")
              .children()
              .eq(3)
              .children()
              .first()
              .children()
              .first()
              .children()
              .eq(2)
              .children()
              .first()
              .children()
              .first()
              .children()
              .first()
              .should("have.class", "chakra-alert")
              .and("have.class", "css-1mzkjkd")
              .and("have.text", "User denied account authorization");
            cy.get(".chakra-portal")
              .children()
              .eq(3)
              .children()
              .first()
              .children()
              .first()
              .children()
              .eq(1)
              .click();
            cy.get(".css-jipda8")
              .find("button")
              .should("have.text", " Connection Error");
          });
      });
  });
});
