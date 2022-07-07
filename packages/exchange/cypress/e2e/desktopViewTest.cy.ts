describe("empty spec", () => {
  beforeEach(() => {
    const baseurl = Cypress.env("baseUrl");
    cy.visit(baseurl);
    cy.viewport("macbook-16");
  });
  it("initial Load", () => {
    cy.get("a").as("links");
    // cy.get("@links").first().contains("See Details");
    cy.get("@links").eq(1).contains("Shrub Main");
    cy.get("@links").eq(2).contains("Paper Gardens");
    cy.get("@links").eq(3).contains("Help");
    cy.get("button").as("buttons");
    cy.get("@buttons").first().should("have.text", "Buy MATIC");
    cy.get("@buttons").eq(1).should("not.be.visible");
    cy.get("@buttons").eq(2).find("svg");
    cy.get("a").contains("Buy MATIC");
  });
  it("Links Shrub Main testing", () => {
    cy.get(".css-1xinffc").find(".css-lygqz2").children().first().as("navLink");
    cy.get("@navLink").find("nav").children().as("navChildren");
    cy.get("@navChildren").eq(0).as("navButton");
    cy.get("@navButton")
      .should("have.attr", "href", "https://shrub.finance")
      .as("navButton");

    cy.get("@navButton").invoke("removeAttr", "target").click({ force: true });
    cy.origin("https://shrub.finance/", () => {
      cy.get("h1").should("have.text", "DeFi crypto options for everyone");
      cy.get(".site-header-inner")
        .find("nav")
        .find(".header-nav-inner")
        .children()
        .as("navChildren");
      cy.get("@navChildren").first().children().as("ulistChildren");
      cy.get("@ulistChildren")
        .first()
        .invoke("removeAttr", "target")
        .click()
        .then(() => {
          cy.visit("https://gardens.shrub.finance");
          cy.get(".css-yd95lt")
            .find(".css-lygqz2")
            .children()
            .first()
            .find("nav")
            .as("gardensNavChildren");
          cy.get("@gardensNavChildren")
            .children()
            .eq(1)
            .click()
            .then(() => {
              cy.url().should("include", "/chapters");
              cy.get(".css-1pg4s0")
                .find("h2")
                .should("have.text", "Paper Gardens");
            });
        });
    });
  });

  it("Links Shrub Main > shrub Paper testing", () => {
    cy.get(".css-1xinffc").find(".css-lygqz2").children().first().as("navLink");
    cy.get("@navLink").find("nav").children().as("navChildren");
    cy.get("@navChildren")
      .eq(0)
      .invoke("removeAttr", "target")
      .click({ force: true });
    cy.origin("https://shrub.finance/", () => {
      cy.get(".site-header-inner")
        .find("nav")
        .find(".header-nav-inner")
        .children()
        .as("navChildren");
      cy.get("@navChildren").first().children().as("ulistChildren");
      cy.get("@ulistChildren")
        .eq(1)
        .invoke("removeAttr", "target")
        .click()
        .then(() => {
          cy.visit("https://paper.shrub.finance/");
          cy.get(".css-lygqz2").children().first().as("topNav");
          cy.get("@topNav").find("nav").children().as("navChildren");
          cy.get("@navChildren")
            .first()
            .then(($a) => {
              $a.attr("target", "self");
            })
            .click()
            .then(() => {
              cy.url().should("include", "/shrubfolio");
            });
          cy.get("@navChildren")
            .eq(1)
            .click()
            .then(() => {
              cy.url().should("include", "/options");
            });
          cy.get("@navChildren").eq(2).click();
          cy.get("@navChildren").eq(3).invoke("removeAttr", "target").click();
        });
    });
  });

  it("Links Shrub Main > Buy Matic testing", () => {
    cy.get(".css-1xinffc").find(".css-lygqz2").children().first().as("navLink");
    cy.get("@navLink").find("nav").children().as("navChildren");
    cy.get("@navChildren")
      .eq(0)
      .invoke("removeAttr", "target")
      .click({ force: true });
    cy.origin("https://shrub.finance/", () => {
      cy.get(".site-header-inner")
        .find("nav")
        .find(".header-nav-inner")
        .children()
        .as("navChildren");
      cy.get("@navChildren").first().children().as("ulistChildren");
      cy.get("@ulistChildren")
        .eq(2)
        .invoke("removeAttr", "target")
        .click()
        .then(() => {
          cy.visit("https://exchange.shrub.finance/");
        });
    });
  });

  it("Links Shrub Main > Blog testing", () => {
    cy.get(".css-1xinffc").find(".css-lygqz2").children().first().as("navLink");
    cy.get("@navLink").find("nav").children().as("navChildren");
    cy.get("@navChildren")
      .eq(0)
      .invoke("removeAttr", "target")
      .click({ force: true });
    cy.origin("https://shrub.finance", () => {
      cy.get(".site-header-inner")
        .find("nav")
        .find(".header-nav-inner")
        .children()
        .as("navChildren");
      cy.get("@navChildren").first().children().as("ulistChildren");
      cy.get("@ulistChildren", { timeout: 10000 }).eq(3).click();
    });
  });

  it("test Theme", () => {
    cy.get("body").should("have.class", "chakra-ui-dark");
    cy.get("button")
      .eq(2)
      .click()
      .then(() => {
        cy.get("body").should("have.class", "chakra-ui-light");
      });
  });
  it("shrub Finance", () => {
    cy.get(".css-1xinffc").find(".css-lygqz2").children().first().as("navLink");
    cy.get("@navLink").find("nav").children().as("navChildren");
    cy.get("@navChildren")
      .eq(0)
      .invoke("removeAttr", "target")
      .click({ force: true });
    cy.origin("https://shrub.finance", () => {
      cy.get("body").should("have.class", "has-animations");
      cy.get(".container").find(".site-header-inner").as("headerdiv");
      cy.get("@headerdiv")
        .find("button")
        .should("have.class", "header-nav-toggle")
        .and("not.be.visible");
      cy.get("@headerdiv")
        .find("nav")
        .should("have.class", "header-nav")
        .find(".header-nav-inner")
        .as("listDiv");
      cy.get("@listDiv")
        .children()
        .should("have.length", 2)
        .first()
        .should("have.class", "list-reset")
        .and("have.class", "text-xs")
        .and("have.class", "header-nav-right")
        .as("firstList");
      cy.get("@firstList").children().should("have.length", 4);
      cy.get("@firstList")
        .children()
        .first()
        .should("have.class", "garden-text");
      cy.get("@firstList")
        .children()
        .first()
        .find("a")
        .should("have.attr", "href", "https://gardens.shrub.finance")
        .and("have.text", "Paper Gardens");
      cy.get("@firstList")
        .children()
        .eq(1)
        .find("a")
        .should("have.attr", "href", "https://paper.shrub.finance")
        .and("have.text", "Shrub Paper");
      cy.get("@firstList")
        .children()
        .eq(2)
        .find("a")
        .should("have.attr", "href", "https://exchange.shrub.finance")
        .and("have.text", "Buy Matic");
      cy.get("@firstList")
        .children()
        .eq(3)
        .find("a")
        .should("have.attr", "href", "https://medium.com/@shrubfinance")
        .and("have.text", "Blog");
      cy.get("@listDiv")
        .children()
        .should("have.length", 2)
        .eq(1)
        .should("have.class", "list-reset")
        .and("have.class", "header-nav-right")
        .as("secondlist");
      cy.get("@secondlist").children().should("have.length", 2);
      cy.get("@secondlist")
        .children()
        .first()
        .find("a")
        .should("have.attr", "href", "https://twitter.com/shrubfinance")
        .find("svg");
      cy.get("@secondlist")
        .children()
        .eq(1)
        .find("a")
        .should("have.attr", "href", "https://discord.gg/csusZhYgTg")
        .and("have.text", "Join Shrub Discord");
      cy.get(".hero-content")
        .find(".container-xs")
        .find("p")
        .should("have.class", "m-0 mb-32")
        .and("have.class", "reveal-from-bottom")
        .and("have.class", "is-revealed")
        .and(
          "have.text",
          "Shrub is building web3 dApps to bridge the gaps between DeFi and the NFT space."
        );

      cy.get("#root")
        .children()
        .eq(1)
        .should("have.class", "site-content")
        .children()
        .eq(7)
        .find(".container")
        .as("section");
      cy.get("@section")
        .find(".container-xs")
        .find("h2")
        .should("have.class", "mt-0")
        .and("have.class", "mb-0")
        .and("have.text", "Team");
      cy.get("#root")
        .children()
        .eq(2)
        .should("have.class", "site-footer")
        .and("have.class", "center-content-mobile")
        .children()
        .first()
        .as("footerchild");
      cy.get("@footerchild")
        .should("have.class", "container")
        .find("nav")
        .children()
        .first()
        .children()
        .should("have.length", 7)
        .as("navChildren");
      cy.get("@navChildren")
        .first()
        .find("a")
        .should("have.attr", "href", "https://gardens.shrub.finance")
        .and("have.text", "Paper Gardens");
      cy.get("@navChildren")
        .eq(1)
        .find("a")
        .should("have.attr", "href", "https://paper.shrub.finance")
        .and("have.text", "Shrub Paper");
      cy.get("@navChildren")
        .eq(2)
        .find("a")
        .should("have.attr", "href", "https://exchange.shrub.finance")
        .and("have.text", "Buy MATIC");
      cy.get("@navChildren")
        .eq(3)
        .find("a")
        .should(
          "have.attr",
          "href",
          "https://opensea.io/collection/shrub-paper-gardens"
        )
        .and("have.text", "Open Sea");
      cy.get("@navChildren")
        .eq(4)
        .find("a")
        .should("have.attr", "href", "https://github.com/shrub-finance")
        .and("have.text", "GitHub");
      cy.get("@navChildren")
        .eq(5)
        .find("a")
        .should("have.attr", "href", "https://medium.com/@shrubfinance")
        .and("have.text", "Blog");
      cy.get("@navChildren")
        .eq(6)
        .find("a")
        .should("have.attr", "href", "https://discord.gg/csusZhYgTg")
        .and("have.text", "Contact Us");
    });
  });

  it("leader Board test", () => {
    cy.get(".css-1xinffc").find(".css-lygqz2").children().first().as("navLink");
    cy.get("@navLink").find("nav").children().as("navChildren");
    cy.get("@navChildren")
      .eq(1)
      .as("navButton")
      .invoke("removeAttr", "target")
      .click({ force: true });
    cy.intercept(
      "POST",
      "https://api.thegraph.com/subgraphs/name/jguthrie7/shrubpapergardens",
      (req) => {
        req.alias = req.body.operationName;
      }
    );
    cy.get(".css-lygqz2")
      .children()
      .first()
      .find("nav")
      .children()
      .eq(2)
      .click();
    cy.wait("@NFTLeaderboard")
      .its("response.body.data.users")
      .should("have.length", 30);
    cy.get("@NFTLeaderboard")
      .its("response.body.data.users.0")
      .and("have.property", "id");
    cy.get(".css-gmuwbf").find("table").should("to.be.visible");
  });
});
