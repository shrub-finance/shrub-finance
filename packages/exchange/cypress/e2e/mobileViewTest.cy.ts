describe("Mobile View Test Case", () => {
  const mobileDeviceName = [
    "iphone-6",
    "iphone-6+",
    "iphone-7",
    "iphone-8",
    "iphone-x",
    "iphone-xr",
    "iphone-se2",
    "iphone-6",
    "samsung-note9",
    "samsung-s10",
  ];
  beforeEach(() => {
    const baseUrl = Cypress.env("baseUrl");
    cy.visit(baseUrl);
  });

  for (let i = 0; i < mobileDeviceName.length; i++) {
    it(`mobile menu icon display for-:${mobileDeviceName[i]}`, () => {
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
        cy.location("href").should("eq", "https://shrub.finance/");
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
              .invoke("removeAttr", "target")
              .click({ timeout: 10000 })
              .then(() => {
                cy.visit("https://gardens.shrub.finance");
                cy.get(".css-lygqz2")
                  .find("button")
                  .should("have.text", "Buy MATIC");
                cy.get(".css-70qvj9")
                  .find("a")
                  .first()
                  .should("have.text", "Roadmap");
                cy.get(".css-1pg4s0")
                  .find("h2")
                  .should("have.text", "Paper Gardens");
                cy.get(".css-1pg4s0")
                  .find("p")
                  .should("have.text", "The most advanced NFT series yet");
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
                          .wait(10000)
                          .click()
                          .then(() => {
                            cy.get(".css-1ahmivy").should("to.be.visible");
                            cy.get(".css-1ahmivy")
                              .find("nav")
                              .children()
                              .as("navLink");
                            cy.get("@navLink")
                              .eq(2)
                              .click()
                              .then(() => {
                                cy.url().should("include", "/chapters");
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
                            // cy.get("@menuButton")
                            //   .click()
                            //   .then(() => {
                            //     cy.get(".css-1ahmivy")
                            //       .find("nav")
                            //       .children()
                            //       .as("navLink");
                            //     cy.get("@navLink")
                            //       .eq(3)
                            //       .invoke("removeAttr", "target")
                            //       .click()
                            //       // .then(() => {
                            //       //   cy.location("href").should(
                            //       //     "eq",
                            //       //     "https://gardens.shrub.finance/opensea"
                            //       //   );
                            //       // });
                            //   });
                            cy.get("@menuButton")
                              .click()
                              .then(() => {
                                cy.get(".css-1ahmivy")
                                  .find("nav")
                                  .children()
                                  .as("navLink");
                                cy.get("@navLink").eq(4).click();
                              });
                            cy.get("@menuButton")
                              .click()
                              .then(() => {
                                cy.get(".css-1ahmivy")
                                  .find("nav")
                                  .children()
                                  .as("navLink");
                                cy.get("@navLink")
                                  .eq(5)
                                  .click()
                                  .then(() => {
                                    cy.get("body").should(
                                      "have.class",
                                      "chakra-ui-light"
                                    );
                                  });
                              });
                          });
                      });
                  });
              });
          });
      });
    });

    it(`mobile menu link 2 Garden Test:- ${mobileDeviceName[i]}`, () => {
      cy.viewport(mobileDeviceName[i]);
      cy.get(".css-1u5xfo8").should("not.be.visible");
      cy.get("button")
        .eq(1)
        .click()
        .then(() => {
          cy.get(".css-1ahmivy").should("to.be.visible");
        });
      cy.get(".css-1ahmivy").find("nav").children().as("navChildren");
      cy.get("@navChildren").eq(1).click();
      cy.origin("https://gardens.shrub.finance", () => {
        cy.get(".css-lygqz2").find("button").should("have.text", "Buy MATIC");
        cy.get(".css-70qvj9").find("a").first().should("have.text", "Roadmap");
        cy.get(".css-1pg4s0").find("h2").should("have.text", "Paper Gardens");
        cy.get(".css-1pg4s0")
          .find(".css-kw8ndg")
          .find("p")
          .should("have.text", "The most advanced NFT series yet");
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
            cy.get(".css-1ahmivy").find("nav").children().as("navChildrenLink");
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
                    cy.get(".css-1ahmivy").find("nav").children().as("navLink");
                    cy.get("@navLink")
                      .eq(2)
                      .click()
                      .then(() => {
                        cy.url().should("include", "/chapters");
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
                    cy.get("@menuButton")
                      .click()
                      .then(() => {
                        cy.get(".css-1ahmivy")
                          .find("nav")
                          .children()
                          .as("navLink");
                        cy.get("@navLink")
                          .eq(3)
                          .invoke("removeAttr", "target")
                          .click()
                          .then(() => {
                            cy.location("href").should(
                              "eq",
                              "https://opensea.io/collection/shrub-paper-gardens"
                            );
                          });
                      });
                  });
              });
          });
      });
    });

    it(`mobile menu link 3 Help Test:-${mobileDeviceName[i]}`, () => {
      cy.viewport(mobileDeviceName[i]);
      cy.get("button").eq(1).click();
      cy.get(".css-1ahmivy").find("nav").children().as("navChildren");
      cy.get("@navChildren").eq(2).invoke("removeAttr", "target").click();
    });

    it(`mobile menu link 4 Theme Change Test:- ${mobileDeviceName[i]}`, () => {
      cy.viewport(mobileDeviceName[i]);
      cy.get("button").eq(1).click();
      cy.get(".css-1ahmivy").find("nav").children().as("navChildren");
      cy.get("@navChildren").eq(3).click();
      cy.get("body").should("have.class", "chakra-ui-light");
    });
  }
});
