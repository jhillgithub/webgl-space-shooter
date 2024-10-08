import { Rect } from "./rect";
import { Sprite } from "./sprite";
import { Texture } from "./texture";

export class Content {
  private static spriteSheet: Texture;
  public static sprites: { [id: string]: Sprite } = {};
  public static testUvTexture: Texture;
  public static async initialize(gl: WebGL2RenderingContext) {
    this.spriteSheet = await Texture.loadTexture(
      gl,
      "assets/Spritesheet/sheet.png"
    );
    this.testUvTexture = await Texture.loadTexture(gl, "assets/test.png");

    await this.loadSpriteSheet();
  }

  private static async loadSpriteSheet() {
    const sheetXmlReq = await fetch("assets/Spritesheet/sheet.xml");
    const sheetXmlText = await sheetXmlReq.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sheetXmlText, "text/xml");
    xmlDoc.querySelectorAll("SubTexture").forEach((subTexture) => {
      const name = subTexture.getAttribute("name")?.replace(".png", "")!;
      const x = parseInt(subTexture.getAttribute("x")!);
      const y = parseInt(subTexture.getAttribute("y")!);
      const width = parseInt(subTexture.getAttribute("width")!);
      const height = parseInt(subTexture.getAttribute("height")!);

      const drawRect = new Rect(0, 0, width, height);
      const sourceRect = new Rect(x, y, width, height);

      this.sprites[name] = new Sprite(this.spriteSheet, drawRect, sourceRect);
    });
  }
}
