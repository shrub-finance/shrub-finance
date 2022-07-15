describe("", () => {
  const mobileDeviceName = ["iphone-6"];
  for (let i = 0; i < mobileDeviceName.length; i++) {
    it("mobile menu icon display", () => {
      cy.viewport(mobileDeviceName[i]);
      cy.visit("http://localhost:3000/");
      cy.get(".css-lygqz2").children().eq(1).children().eq(2).click();
      cy.get(".css-1ahmivy")
        .find("nav")
        .children()
        .first()
        .click()
        .then(() => {
          cy.url().should("include", "/my-garden");
          cy.get(".css-lygqz2")
            .children()
            .eq(1)
            .should("have.class", "css-70qvj9")
            .as("rightNav");
          cy.get("@rightNav")
            .children()
            .first()
            .should("have.text", "Buy MATIC");
          cy.get("@rightNav")
            .children()
            .eq(2)
            .children()
            .first()
            .should("have.class", "chakra-button")
            .and("have.text", " Connect Wallet");
          cy.get(".App")
            .children()
            .eq(1)
            .children()
            .first()
            .should("have.class", "chakra-container")
            .and("have.class", "css-1a176n2")
            .children()
            .as("bodyChildren");
          cy.get("@bodyChildren")
            .eq(1)
            .should("have.class", "css-gmuwbf")
            .children()
            .first()
            .should("have.class", "chakra-stack")
            .and("have.class", "css-13b47m9")
            .children()
            .as("bodytext");
          cy.get("@bodytext")
            .first()
            .should("have.class", "chakra-heading")
            .and("have.class", "css-1ndtjbd")
            .and("have.text", "Paper Gardens");
          cy.get("@bodytext")
            .eq(1)
            .should("have.class", "chakra-text")
            .and("have.class", "css-1w72341")
            .and("have.text", "Place where seeds grow into Shrubs!");
          cy.get("@bodytext")
            .eq(2)
            .should("have.class", "chakra-text")
            .and("have.class", "css-1w72341")
            .and("have.text", "Select seeds or plants below to grow them.");
        });
    });

    it("My Garden Link", () => {
      cy.viewport(mobileDeviceName[i]);
      cy.visit("http://localhost:3000/");
      cy.get(".css-lygqz2").children().eq(1).children().eq(2).click();
      cy.get(".css-1ahmivy")
        .find("nav")
        .children()
        .first()
        .click()
        .then(() => {
          cy.url().should("include", "/my-garden");
          cy.get(".css-lygqz2")
            .children()
            .eq(1)
            .should("have.class", "css-70qvj9")
            .as("rightNav");
          cy.get("@rightNav")
            .children()
            .first()
            .should("have.text", "Buy MATIC");
          cy.get("@rightNav")
            .children()
            .eq(2)
            .children()
            .first()
            .should("have.class", "chakra-button")
            .and("have.class", "css-sqvekd")
            .and("have.text", " Connect Wallet");
          cy.get(".App")
            .children()
            .eq(1)
            .children()
            .first()
            .should("have.class", "chakra-container")
            .and("have.class", "css-1a176n2")
            .children()
            .as("bodyChildren");
          cy.get("@bodyChildren")
            .eq(1)
            .should("have.class", "css-gmuwbf")
            .children()
            .first()
            .should("have.class", "chakra-stack")
            .and("have.class", "css-13b47m9")
            .children()
            .as("bodytext");
          cy.get("@bodytext")
            .first()
            .should("have.class", "chakra-heading")
            .and("have.class", "css-1ndtjbd")
            .and("have.text", "Paper Gardens");
          cy.get("@bodytext")
            .eq(1)
            .should("have.class", "chakra-text")
            .and("have.class", "css-1w72341")
            .and("have.text", "Place where seeds grow into Shrubs!");
          cy.get("@bodytext")
            .eq(2)
            .should("have.class", "chakra-text")
            .and("have.class", "css-1w72341")
            .and("have.text", "Select seeds or plants below to grow them.");
        });
    });
    it("Chapters Link", () => {
      cy.viewport(mobileDeviceName[i]);
      cy.visit("http://localhost:3000/");
      cy.get(".css-lygqz2").children().eq(1).children().eq(2).click();
      cy.get(".css-1ahmivy")
        .find("nav")
        .children()
        .eq(1)
        .click()
        .then(() => {
          cy.url().should("include", "/chapters");
          cy.get(".App")
            .children()
            .eq(1)
            .children()
            .first()
            .should("have.class", "chakra-container")
            .and("have.class", "css-1a176n2")
            .children()
            .as("bodyChildren");
          cy.get("@bodyChildren")
            .first()
            .should("have.class", "css-1h8zsow")
            .children()
            .first()
            .should("have.class", "css-1pg4s0")
            .children()
            .as("bodyText");
          cy.get("@bodyText").first().should("have.text", "Paper Gardens");
          cy.get("@bodyText")
            .eq(1)
            .should("have.id", "chapter1")
            .and("have.class", "css-1hqusll")
            .children()
            .first()
            .should("have.text", "CHAPTER 1: THE TRAVELLING MERCHANT");
        });
    });

    it("leader Board test", () => {
      cy.viewport(mobileDeviceName[i]);
      cy.visit("http://localhost:3000/");
      cy.get(".css-lygqz2").children().eq(1).children().eq(2).click();
      cy.intercept(
        "POST",
        "https://api.thegraph.com/subgraphs/name/jguthrie7/shrubpapergardens",
        (req) => {
          req.alias = req.body.operationName;
        }
      );
      cy.get(".css-1ahmivy").find("nav").children().eq(2).click();
      cy.wait("@NFTLeaderboard")
        .its("response.body.data.users")
        .should("have.length", 30);
      cy.get("@NFTLeaderboard")
        .its("response.body.data.users.0")
        .and("have.property", "id");
      cy.get(".css-gmuwbf").find("table").should("to.be.visible");
    });

    it("opensea Link", () => {
      cy.viewport(mobileDeviceName[i]);
      cy.visit("http://localhost:3000/");
      cy.get(".css-lygqz2").children().eq(1).children().eq(2).click();
      cy.get(".css-1ahmivy")
        .find("nav")
        .children()
        .eq(3)
        .click()
        .then(() => {
          cy.url().should("include", "/opensea");
        });
    });

    it("Blog Link", () => {
      cy.viewport(mobileDeviceName[i]);
      cy.visit("http://localhost:3000/");
      cy.get(".css-lygqz2").children().eq(1).children().eq(2).click();
      cy.get(".css-1ahmivy")
        .find("nav")
        .children()
        .eq(4)
        .invoke("removeAttr", "target")
        .click();

      cy.origin("https://medium.com/@shrubfinance", () => {
        cy.url().should("include", "https://medium.com/@shrubfinance");
      });
    });

    it("theme Link", () => {
      cy.viewport(mobileDeviceName[i]);
      cy.visit("http://localhost:3000/");
      cy.get(".css-lygqz2").children().eq(1).children().eq(2).click();
      cy.get(".css-1ahmivy")
        .find("nav")
        .children()
        .eq(5)
        .click()
        .then(() => {
          cy.get("body").should("have.class", "chakra-ui-light");
        });
    });
  }
});
