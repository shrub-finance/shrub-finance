describe("empty spec", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });
  it("initial Load", () => {
    cy.get("a").as("links");
    cy.get("@links").first().contains("See Details");
    cy.get("@links").eq(2).contains("Shrub Main");
    cy.get("@links").eq(3).contains("Paper Gardens");
    cy.get("@links").eq(4).contains("Help");
    cy.get("button").as("buttons");
    cy.get("@buttons").first().should("have.text", "Buy MATIC");
    cy.get("@buttons").eq(1).should("not.be.visible");
    cy.get("@buttons").eq(2).find("svg");
    cy.get("a").contains("Buy MATIC");
  });
  // it('Links testing', () => {
  //   cy.get("a").contains("Shrub Main").click();
  //   cy.get("a").contains("Paper Gardens").click();
  //   cy.get("a").contains("Help").click()

  //   //
  //   // cy.get("a").contains("Help");
  // })

  // it("test Theme",()=>{
  //   cy.visit('http://localhost:3000/');
  //   cy.get("body").should("have.class","chakra-ui-dark");
  //   cy.get("button").eq(2).click().then(()=>{
  //     cy.get("body").should("have.class","chakra-ui-light");
  //   });

  // })
  // it("test Paper Gardens",()=>{
  //   cy.visit('http://localhost:3000/')
  //   cy.get("a").contains("Paper Gardens").click().then(()=>{
  //     cy.origin("http://gardens.shrub.finance/",()=>{
  //       console.log("SuccesFull")
  //     })
  //   });
  // })

  // it("test Paper Gardens",()=>{
  //   cy.visit('http://localhost:3000/')
  //   cy.get("a").contains("Help").click().then(()=>{
  //     cy.origin("https://discord.com/invite/ntU4GhfEFP",()=>{
  //       console.log("SuccesFull")
  //     })
  //   });
  // })

  // it("test Paper Gardens",()=>{
  //   cy.visit('http://localhost:3000/')
  //   cy.get("button").contains("Buy MATIC").click().then(()=>{
  //     // cy.origin("https://discord.com/invite/ntU4GhfEFP",()=>{
  //     //   console.log("SuccesFull")
  //     // })

  //   });
  //   //cy.url().should('eq', 'https://discord.com/invite/ntU4GhfEFP');
  //   console.log("url",cy.url())
  // })
});
