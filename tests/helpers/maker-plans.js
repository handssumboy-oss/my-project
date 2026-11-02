export const MAKER_PLANS={
 green:[['cleanup','train','rest'],['cleanup','cleanup','rest'],['cleanup','talk','rest'],['cleanup','cleanup','rest']],
 companion:[['train','talk','rest'],['visit','visit','rest'],['visit','visit','rest'],['visit','visit','rest']],
 festival:[['festival','talk','rest'],['festival','train','rest'],['festival','festival','rest'],['festival','festival','rest']],
 story:[['reading','talk','rest'],['reading','train','rest'],['reading','reading','rest'],['reading','reading','rest']],
};
export async function playMakerWeeks(page,plan){
 for(const week of plan){
  for(const id of week)await page.locator(`[data-activity="${id}"]`).click();
  await page.locator('#begin-week').click();
  for(let day=0;day<3;day++){
   await page.locator('.choice:not(:disabled)').last().click();
   await page.locator('#continue-day').click();
  }
  await page.locator('#next-week').click();
 }
}
