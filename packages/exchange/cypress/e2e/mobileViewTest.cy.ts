describe("Mobile View Test Case", () => {
  // const mobileDeviceName=["iphone-3","iphone-4","iphone-5","iphone-6","iphone-6+","iphone-7","iphone-8","iphone-x",
  // "iphone-xr","iphone-se2","iphone-6","samsung-note9","samsung-s10"];
  const mobileDeviceName = ["iphone-6"];
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  for (let i = 0; i < mobileDeviceName.length; i++) {
    it("mobile menu icon display", () => {
      cy.viewport(mobileDeviceName[i]);
      cy.get(".css-1u5xfo8").should("not.be.visible");
      cy.get("button")
        .eq(1)
        .click()
        .then(() => {
          cy.get(".css-1ahmivy").should("to.be.visible");
        });
      cy.get(".css-1ahmivy").find("nav").children().as("navChildren");
      cy.get("@navChildren").eq(0).click();
      cy.origin("https://shrub.finance", () => {
        cy.visit("http://shrub.finance");
        // cy.get("div").should("have.class","site-header").and("have.class","reveal-from-bottom").and("have.class","is-revealed")
        cy.get("h1").contains("DeFi crypto options for");
        cy.get("button")
          .should("have.class", "header-nav-toggle")
          .click()
          .then(() => {
            cy.get("nav").should("to.be.visible");
            cy.get("nav").find(".header-nav-inner").children().as("navList");
            cy.get("@navList").first().find("li").should("have.length", 4);
            cy.get("@navList").eq(1).find("li").should("have.length", 2);
            cy.get("@navList").first().children().as("liChildren");
            cy.get("@liChildren")
              .first()
              .click()
              .then(() => {
                cy.visit("https://gardens.shrub.finance");
                cy.get(".css-lygqz2")
                  .find("button")
                  .should("have.text", "Buy MATIC");
                cy.get(".css-70qvj9")
                  .find("a")
                  .first()
                  .should("have.text", "Join Discord");
                cy.get(".css-1pg4s0")
                  .find("h2")
                  .should("have.text", "Paper Gardens");
                cy.get(".css-1pg4s0")
                  .find("p")
                  .should("have.text", "The most advanced NFT series");
                cy.get(".css-70qvj9")
                  .find("button")
                  .eq(1)
                  .click()
                  .then(() => {
                    cy.get(".css-1ahmivy").should("to.be.visible");
                    cy.get(".css-1ahmivy")
                      .find("nav")
                      .children()
                      .should("have.length", 6);
                    cy.get(".css-1ahmivy")
                      .find("nav")
                      .children()
                      .as("navChildrenLink");
                    cy.get("@navChildrenLink")
                      .first()
                      .click()
                      .then(() => {
                        cy.get(".css-yd95lt")
                          .find(".css-70qvj9")
                          .find("button")
                          .contains("Buy MATIC");
                        cy.get(".css-yd95lt")
                          .find(".css-70qvj9")
                          .find("button")
                          .eq(2)
                          .as("menuButton");
                        cy.get("@menuButton")
                          .click()
                          .then(() => {
                            cy.get(".css-1ahmivy").should("to.be.visible");
                            cy.get(".css-1ahmivy")
                              .find("nav")
                              .children()
                              .as("navLink");
                            cy.get("@navLink")
                              .eq(1)
                              .click()
                              .then(() => {
                                cy.get(".css-1pg4s0")
                                  .find("h2")
                                  .should("have.text", "Paper Gardens");
                                cy.get("#chapter1")
                                  .find("p")
                                  .should(
                                    "have.text",
                                    "CHAPTER 1: THE TRAVELLING MERCHANT"
                                  );
                              });
                            //  cy.get("@menuButton").eq(2).click();
                            // cy.get("@navLink").eq(3).click();
                          });
                      });
                  });
              });
          });
      });
    });
  }
});
