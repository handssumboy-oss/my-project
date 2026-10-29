import { test, expect } from '@playwright/test';
test('러너와 미션 캐릭터에 실제 알파가 있고 흰 사각형 스타일이 없음', async ({page},info)=>{
 for(const [path,selector,name] of [['/','.hero-sticker img','runner'],['/classic.html','.official-character','classic']]){
  await page.goto(path);const img=page.locator(selector);await expect(img).toBeVisible();
  const result=await img.evaluate(async image=>{
   await image.decode();const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const {data}=ctx.getImageData(0,0,c.width,c.height);const at=(x,y)=>data[(y*c.width+x)*4+3];const style=getComputedStyle(image);let empty=0,solid=0;for(let i=3;i<data.length;i+=4){if(data[i]===0)empty++;if(data[i]>=250)solid++;}
   return {corners:[at(0,0),at(c.width-1,0),at(0,c.height-1),at(c.width-1,c.height-1)],empty:empty/(c.width*c.height),solid:solid/(c.width*c.height),background:style.backgroundColor,shadow:style.boxShadow};
  });
  expect(result.corners).toEqual([0,0,0,0]);expect(result.empty).toBeGreaterThan(.25);expect(result.solid).toBeGreaterThan(.1);expect(result.background).toBe('rgba(0, 0, 0, 0)');expect(result.shadow).toBe('none');
  await page.screenshot({path:`test-results/alpha-${name}-${info.project.name}.png`,fullPage:true});
 }
});
