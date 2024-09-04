/**
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { TurboModule, TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import image from '@ohos.multimedia.image';
import { media } from '@kit.MediaKit';
import util from '@ohos.util';
import { fileIo as fs } from '@kit.CoreFileKit';

export class RNThumbnailTurboModule extends TurboModule {
  constructor(ctx: TurboModuleContext) {
    super(ctx);
  }

  get(filePath: string): Promise<{ path: string, width: number, height: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        filePath = filePath.replace("file://", "");

        // 创建 AVImageGenerator 对象
        const avImageGenerator = await media.createAVImageGenerator();

        // 打开文件并设置 fdSrc
        avImageGenerator.fdSrc = await fs.openSync(filePath, fs.OpenMode.READ_WRITE);

        // 设置查询选项和像素图参数
        const queryOption = media.AVImageQueryOptions.AV_IMAGE_QUERY_NEXT_SYNC;
        const param: media.PixelMapParams = {
          width: -1,
          height: -1,
        };

        // 获取指定时间的像素图
        const pixel_map = await avImageGenerator.fetchFrameByTime(1000000, queryOption, param);

        // 释放资源
        avImageGenerator.release();

        // 获取图像信息
        const imageInfo = await pixel_map.getImageInfo();

        // 获取能力上下文的文件目录
        const abilityContext = this.ctx.uiAbilityContext;
        const cacheDir = abilityContext.filesDir + "/thumb";

        // 检查缓存目录是否存在，若不存在则创建
        if (!fs.accessSync(cacheDir)) {
          fs.mkdirSync(cacheDir);
        }

        // 生成文件名
        const fileName = "thumb-" + util.generateRandomUUID(true) + ".jpeg";

        // 构建图像路径
        const imagePath = `${cacheDir}/${fileName}`;

        // 打开或创建文件
        const file = fs.openSync(imagePath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);

        // 创建图像打包器并设置打包选项
        const imagePackerApi = image.createImagePacker();
        const packOpts = { format: "image/jpeg", quality: 100 };

        // 打包像素图为数据并写入文件
        const data = await imagePackerApi.packing(pixel_map, packOpts);
        fs.writeSync(file.fd, data);

        // 关闭文件
        fs.closeSync(file);

        // 返回包含路径、宽度和高度的对象
        resolve({
          path: "file://" + cacheDir + '/' + fileName,
          width: imageInfo.size.width,
          height: imageInfo.size.height,
        });
      } catch (error) {
        console.error("E_RNThumnail_ERROR", error);
        reject(new Error("E_RNThumnail_ERROR"));
      }
    });
  }
}