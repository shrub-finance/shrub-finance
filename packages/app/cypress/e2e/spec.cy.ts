describe("empty spec", () => {
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
  // it('passes', () => {
  //   cy.get(".css-jipda8").find("button").should("have.text"," Connect Wallet").click();
  //   cy.get(".chakra-portal");
  //   cy.get(".chakra-portal").children().eq(3).children().first().children().first().children().eq(2).children().first()
  //   .children().as("connectWalletModal");
  //   cy.get("@connectWalletModal").first().click();
  //   cy.get(".chakra-portal").children().eq(3).children().first().children().first().children()
  //   .eq(2).children().first().children().first().children().first().as("afterconnectwalletModal");
  //   cy.get("@afterconnectwalletModal").should("have.class","chakra-alert").and("have.class","css-1mzkjkd")
  // });
});
