describe("nav Link Test", () => {
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
  it("shrubfolio", () => {
    cy.get("@topNav").children().first().children().eq(1).as("nav");
    cy.get("@nav").children().first().as("first");
    cy.wait(1000);
    cy.get("@first").click();
    cy.url().should("include", "/shrubfolio");
    cy.get(".App").children().eq(1).as("bodyChildren");
    cy.get("@bodyChildren")
      .children()
      .first()
      .should("have.class", "chakra-heading")
      .and("have.class", "css-4jahvo")
      .and("have.text", " Shrubfolio");
    cy.get("@bodyChildren")
      .children()
      .eq(2)
      .should("have.class", "chakra-container")
      .and("have.class", "css-11sv4kc")
      .children()
      .first()
      .children()
      .first()
      .should("have.attr", "type", "button")
      .and("have.class", "chakra-button")
      .and("have.class", "css-1c44cyw")
      .and("have.text", "Deposit")
      .and("be.disabled");
    cy.get("@bodyChildren")
      .children()
      .eq(2)
      .children()
      .first()
      .children()
      .eq(1)
      .should("have.attr", "type", "button")
      .and("have.class", "chakra-button")
      .and("have.class", "css-1m8yhbe")
      .and("have.text", "Withdraw")
      .and("be.disabled");
  });

  it("options", () => {
    cy.get("@topNav").children().first().children().eq(1).as("nav");
    cy.get("@nav").children().eq(1).as("second");
    cy.wait(1000);
    cy.get("@second").click();
    cy.url().should("include", "/options");
    cy.get(".App").children().eq(1).as("bodyChildren");
    cy.get("@bodyChildren")
      .children()
      .eq(1)
      .should("have.class", "css-gmuwbf")
      .children()
      .first()
      .should("have.class", "chakra-menu__menu-button")
      .and("have.class", "css-kjvu41")
      .find("h2")
      .and("have.text", "sMATIC Options");
    cy.get("@bodyChildren")
      .children()
      .eq(3)
      .should("have.class", "chakra-container")
      .and("have.class", "css-16rvwks")
      .children()
      .first()
      .children()
      .eq(1)
      .should("have.class", "css-1h1s0i3")
      .and(
        "have.text",
        "No options available yet, let the Shrub Team know in Discord."
      );
  });

  it("Docs", () => {
    cy.get("@topNav").children().first().children().eq(1).as("nav");
    cy.get("@nav").children().eq(2).as("third");
    cy.wait(1000);
    cy.get("@third").invoke("removeAttr", "target").click();
    cy.origin("https://docs.shrub.finance", () => {
      cy.url().should("include", "https://docs.shrub.finance/");
    });
  });

  it("Report Issue", () => {
    cy.get("@topNav").children().first().children().eq(1).as("nav");
    cy.get("@nav").children().eq(3).as("fourth");
    cy.wait(1000);
    cy.get("@fourth").invoke("removeAttr", "target").click();
    cy.origin("https://discord.com/invite/KQ88Pc7q", () => {
      cy.url().should("include", "https://discord.com/invite/KQ88Pc7q");
    });
  });
});
