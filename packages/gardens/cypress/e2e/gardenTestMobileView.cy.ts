describe("", () => {
  const mobileDeviceName = ["iphone-6"];

  for (let i = 0; i < mobileDeviceName.length; i++) {
    it("mobile menu icon display", () => {
      cy.viewport(mobileDeviceName[i]);
      cy.visit("http://localhost:3000/");
      cy.get("body").should("have.class", "chakra-ui-dark");
      cy.get("#root").children().eq(1).should("have.class", "App").as("app");
      cy.get("@app").find(".css-lygqz2").as("nav");
      cy.get("@nav")
        .children()
        .first()
        .should("have.class", "chakra-stack")
        .and("have.class", "css-1ocidfa");
      cy.get("@nav")
        .children()
        .first()
        .children()
        .eq(1)
        .should("not.be.visible");
      cy.get("@nav").children().eq(1).should("have.class", "css-70qvj9");
      cy.get("@nav").children().eq(1).children().as("navRight");
      cy.get("@navRight")
        .first()
        .should("have.attr", "type", "button")
        .and("have.text", "Buy MATIC");
      cy.get("@navRight")
        .eq(1)
        .should(
          "have.attr",
          "href",
          "https://medium.com/@shrubfinance/shrub-roadmap-2022-b947b5ce1435"
        )
        .and("have.text", "Roadmap");
      cy.get("@navRight")
        .eq(2)
        .should("have.attr", "type", "button")
        .click()
        .then(() => {
          cy.get(".css-1ahmivy").should("to.be.visible");
          cy.get(".css-1ahmivy")
            .children()
            .first()
            .children()
            .should("have.length", 6)
            .as("navChildren");
          cy.get("@navChildren")
            .first()
            .should("have.attr", "href", "/my-garden");
          cy.get("@navChildren").eq(1).should("have.attr", "href", "/chapters");
          cy.get("@navChildren")
            .eq(2)
            .should("have.attr", "href", "/leaderboard");
          cy.get("@navChildren").eq(3).should("have.attr", "href", "/opensea");
          cy.get("@navChildren")
            .eq(4)
            .should("have.attr", "href", "https://medium.com/@shrubfinance");
          cy.get("@navChildren")
            .eq(5)
            .should("have.class", "css-3v2eta")
            .and("have.text", "Light Mode");
        });
      cy.get("@navRight")
        .eq(2)
        .should("have.attr", "type", "button")
        .click()
        .then(() => {
          cy.get(".css-yd95lt").children().should("have.length", 1);
        });
      cy.get(".css-1pg4s0")
        .find("h2")
        .should("have.class", "chakra-heading")
        .and("have.class", "css-hu9z0o")
        .and("have.text", "Paper Gardens");
      cy.get(".css-kw8ndg")
        .find("p")
        .should("have.class", "chakra-text")
        .and("have.class", "css-u74gli")
        .and("have.text", "Experience the most advanced NFT series yet");

      cy.get("@app")
        .children()
        .eq(1)
        .children()
        .eq(1)
        .should("have.class", "chakra-container")
        .and("have.class", "css-wmz2fb")
        .children()
        .as("bodyChildren");
      cy.get("@bodyChildren")
        .first()
        .should("have.class", "css-10tvc0o")
        .children()
        .first()
        .as("textDisplay");
      cy.get("@textDisplay")
        .find("h2")
        .should("have.class", "chakra-heading")
        .and("have.class", "css-1a7e5dl")
        .and("have.text", "First on-chain growth NFT");
      cy.get("@textDisplay")
        .find("p")
        .should("have.class", "chakra-text")
        .and("have.class", "css-1f3ehju")
        .and(
          "have.text",
          "For the first time ever, grow an NFT by interacting with it on-chain.Planting your seed into a pot creates a potted plant."
        );
      cy.get("@textDisplay")
        .children()
        .eq(2)
        .should("have.class", "chakra-text")
        .and("have.class", "css-1f3ehju")
        .and(
          "have.text",
          "Planting your seed into a pot creates a potted plant."
        );
      cy.get("@app")
        .children()
        .eq(1)
        .children()
        .eq(2)
        .should("have.class", "chakra-container")
        .and("have.class", "css-1v8xkkl")
        .children()
        .as("bodyChildren");
      cy.get("@bodyChildren")
        .first()
        .should("have.class", "css-os0yy8")
        .children()
        .first()
        .should("have.class", "css-2qrmgs")
        .children()
        .as("textchildren");
      cy.get("@textchildren")
        .first()
        .should("have.class", "chakra-heading")
        .and("have.class", "css-1a7e5dl")
        .and("have.text", "Grow your Shrub");
      cy.get("@textchildren")
        .eq(1)
        .should("have.class", "chakra-text")
        .and("have.class", "css-1f3ehju")
        .and("have.text", "Take care of your potted plant to help it grow.");
      cy.get("@textchildren")
        .eq(2)
        .should("have.class", "chakra-text")
        .and("have.class", "css-1f3ehju")
        .and(
          "have.text",
          "Watering potted plants makes them grow big and strong. Fertilizing also gives them a boost! "
        );
      cy.get("@textchildren")
        .eq(3)
        .should("have.class", "chakra-text")
        .and("have.class", "css-1f3ehju")
        .and(
          "have.text",
          "Traits of your potted plant will update dynamically when you interact with it!"
        );
      cy.get("@app")
        .children()
        .eq(1)
        .children()
        .eq(3)
        .should("have.class", "chakra-container")
        .and("have.class", "css-1uz5p5j")
        .children()
        .as("bodyChildren");
      cy.get("@bodyChildren")
        .first()
        .should("have.class", "css-1ht5vmb")
        .children()
        .first()
        .should("have.class", "css-2qrmgs")
        .children()
        .as("textchildren");
      cy.get("@textchildren")
        .first()
        .should("have.class", "chakra-heading")
        .and("have.class", "css-1a7e5dl")
        .and("have.text", "Harvest your Shrub");
      cy.get("@textchildren")
        .eq(1)
        .should("have.class", "chakra-text")
        .and("have.class", "css-1f3ehju")
        .and(
          "have.text",
          "Once your potted plant is fully grown it is time to harvest."
        );
      cy.get("@textchildren")
        .eq(2)
        .should("have.class", "chakra-text")
        .and("have.class", "css-1f3ehju")
        .and("have.text", "Out comes a shrub!");
      cy.get("@textchildren")
        .eq(3)
        .should("have.class", "chakra-text")
        .and("have.class", "css-1f3ehju")
        .and(
          "have.text",
          "Shrub traits are based on the type of seed you planted, emotion and DNA. Some combinations result in rare traits!"
        );
      cy.get("@textchildren")
        .eq(4)
        .should("have.class", "chakra-text")
        .and("have.class", "css-1f3ehju")
        .and("have.text", "Every Shrub is unique.");
      cy.get("@app")
        .children()
        .eq(1)
        .children()
        .eq(4)
        .should("have.class", "chakra-container")
        .and("have.class", "css-8wajl2")
        .children()
        .as("bodyChildren");
      cy.get("@bodyChildren")
        .first()
        .should("have.class", "css-x18o4f")
        .children()
        .eq(2)
        .should("have.class", "css-1tn4a30")
        .children()
        .as("textchildren");
      cy.get("@textchildren")
        .first()
        .should("have.class", "chakra-heading")
        .and("have.class", "css-1a7e5dl")
        .and("have.text", "The story so far");
      cy.get("@textchildren")
        .eq(1)
        .should("have.class", "chakra-text")
        .and("have.class", "css-1f3ehju")
        .and(
          "have.text",
          "It all started with a visit from the mysterious traveller the Paper Merchant. He came with the seeds. Read all the chapters here."
        );
      cy.get("@textchildren")
        .eq(2)
        .should("have.class", "chakra-text")
        .and("have.class", "css-1f3ehju")
        .and(
          "have.text",
          "The seeds are now ready to transform and grow. The Potter has come to help. He has a limited supply of pots which the seeds can be planted in. It is the moment that everyone has been waiting for."
        );
      cy.get("@textchildren")
        .eq(3)
        .should("have.class", "chakra-text")
        .and("have.class", "css-1f3ehju")
        .and("have.text", " It is time to grow!");
      cy.get("@app")
        .children()
        .eq(1)
        .children()
        .eq(9)
        .should("have.class", "chakra-container")
        .and("have.class", "css-wmz2fb")
        .children()
        .as("bodyChildren");
      cy.get("@bodyChildren")
        .first()
        .should("have.class", "css-1w94zre")
        .children()
        .first()
        .should("have.class", "chakra-heading")
        .and("have.class", "css-1ggfdz3")
        .and("have.text", "Get Started");
      cy.get("@bodyChildren")
        .first()
        .should("have.class", "css-1w94zre")
        .children()
        .eq(1)
        .should("have.class", "css-gmuwbf")
        .children()
        .first()
        .find(".css-0")
        .children()
        .first()
        .should("have.attr", "href", "https://discord.gg/csusZhYgTg")
        .and("have.text", "Join Discord ");
      cy.get("@bodyChildren")
        .first()
        .should("have.class", "css-1w94zre")
        .children()
        .eq(1)
        .should("have.class", "css-gmuwbf")
        .children()
        .first()
        .find(".css-0")
        .children()
        .eq(1)
        .should("have.class", "css-gmuwbf")
        .find("p")
        .should("have.class", "chakra-text")
        .and("have.class", "css-2qrmgs")
        .and(
          "have.text",
          "Connect with the core team, and get detailed updates"
        );
      cy.get("@bodyChildren")
        .first()
        .should("have.class", "css-1w94zre")
        .children()
        .eq(1)
        .should("have.class", "css-gmuwbf")
        .children()
        .first()
        .children()
        .eq(2)
        .children()
        .first()
        .should("have.attr", "href", "https://twitter.com/shrubfinance")
        .and("have.text", "Follow Twitter ");
      cy.get("@bodyChildren")
        .first()
        .should("have.class", "css-1w94zre")
        .children()
        .eq(1)
        .should("have.class", "css-gmuwbf")
        .children()
        .first()
        .children()
        .eq(2)
        .children()
        .eq(1)
        .should("have.class", "css-gmuwbf")
        .find("p")
        .should("have.class", "chakra-text")
        .and("have.class", "css-2qrmgs")
        .and("have.text", "Official announcements");
    });
  }
});
