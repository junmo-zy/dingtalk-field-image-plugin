import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode, AuthorizationType } from 'dingtalk-docs-cool-app';
const { t } = fieldDecoratorKit;

// ==================== 接口类型定义 ====================
// Bestboy /api/service/invoke 响应格式
interface InvokeResponse {
  code?: number;    // 0=成功, 40001=积分不足, 40002=AI服务错误, 40003=敏感词
  message?: string;
  data?: {
    task_id?: string;
    status?: string;  // pending, processing, completed, failed
    result_url?: string;
    result_urls?: string[];
    image_url?: string;
    image_urls?: string[];
    cost?: number;
    balance?: number;
    error_msg?: string;
    error_message?: string;
  };
  error?: any;
  [key: string]: any;
}

// Bestboy /api/service/task/{task_id} 响应格式
interface TaskResponse {
  code?: number;
  message?: string;
  data?: {
    task_id?: string;
    status?: string;  // pending, processing, completed, failed
    result_url?: string;
    result_urls?: string[];
    image_url?: string;
    image_urls?: string[];
    progress?: number;
    cost?: number;
    error_msg?: string;
    error_message?: string;
  };
  error?: any;
  [key: string]: any;
}

// 附件字段类型
interface Attachment {
  name: string;
  type: string;
  size: number;
  tmp_url: string;
}

// 域名白名单
fieldDecoratorKit.setDomainList(['aivip.link']);

fieldDecoratorKit.setDecorator({
  name: 'AI生图 - 文生图/图生图',
  i18nMap: {
    'zh-CN': {
      'promptLabel': '图片生成提示词',
      'promptPlaceholder': '请输入图片生成提示词，描述你想要生成的图片',
      'referenceImageLabel': '参考图',
      'aspectRatioLabel': '宽高比',
      'resolutionLabel': '分辨率',
      'authorizationName': 'AIFY API 授权',
      'authorizationTooltip': '请访问 https://aivip.link/dashboard/apikey 查看或生成您的 API Key。',
    },
    'en-US': {
      'promptLabel': 'Image Generation Prompt',
      'promptPlaceholder': 'Enter your image generation prompt',
      'referenceImageLabel': 'Reference Image',
      'aspectRatioLabel': 'Aspect Ratio',
      'resolutionLabel': 'Resolution',
      'authorizationName': 'AIFY API Authorization',
      'authorizationTooltip': 'Visit https://aivip.link/dashboard/apikey to get your API Key.',
    },
    'ja-JP': {
      'promptLabel': '画像生成プロンプト',
      'promptPlaceholder': '画像生成プロンプトを入力してください',
      'referenceImageLabel': '参考画像',
      'aspectRatioLabel': 'アスペクト比',
      'resolutionLabel': '解像度',
      'authorizationName': 'AIFY API 認証',
      'authorizationTooltip': 'https://aivip.link/dashboard/apikey でAPIキーを取得してください。',
    },
  },
  // 授权配置：Bearer Token 模式
  authorizations: {
    id: 'aify_auth',
    label: t('authorizationName'),
    type: AuthorizationType.HeaderBearerToken,
    platform: 'AIFY',
    required: true,
    instructionsUrl: 'https://aivip.link/dashboard/apikey',
    tooltips: t('authorizationTooltip'),
    icon: {
      light: 'https://youke.xn--y7xa690gmna.cn/s1/2026/02/10/698acaf10b0f7.webp',
      dark: 'https://youke.xn--y7xa690gmna.cn/s1/2026/02/10/698acaf10b0f7.webp',
    },
  },
  // 表单：NanoBanana2 生图参数
  formItems: [
    {
      key: 'prompt',
      label: t('promptLabel'),
      component: FormItemComponent.Textarea,
      props: {
        placeholder: t('promptPlaceholder'),
        enableFieldReference: true,
      },
      validator: { required: true },
    },
    {
      key: 'referenceImage',
      label: t('referenceImageLabel'),
      component: FormItemComponent.FieldSelect,
      props: {
        mode: 'single',
        supportTypes: [FieldType.Attachment],
      },
      validator: { required: false },
    },
    {
      key: 'aspectRatio',
      label: t('aspectRatioLabel'),
      component: FormItemComponent.SingleSelect,
      props: {
        defaultValue: '1:1',
        options: [
          { key: '1:1',  title: '1:1' },
          { key: '9:16', title: '9:16（竖版）' },
          { key: '16:9', title: '16:9（横版）' },
          { key: '4:3',  title: '4:3' },
          { key: '3:4',  title: '3:4' },
          { key: '3:2',  title: '3:2' },
          { key: '2:3',  title: '2:3' },
          { key: '5:4',  title: '5:4' },
          { key: '4:5',  title: '4:5' },
          { key: '21:9', title: '21:9' },
        ],
      },
      validator: { required: false },
    },
    {
      key: 'resolution',
      label: t('resolutionLabel'),
      component: FormItemComponent.SingleSelect,
      props: {
        defaultValue: '1K',
        options: [
          { key: '1K', title: '1K (1024px)' },
          { key: '2K', title: '2K (2048px)' },
          { key: '4K', title: '4K (4096px) - 积分×2' },
        ],
      },
      validator: { required: false },
    },
  ],
  // 返回附件类型（图片）
  resultType: {
    type: FieldType.Attachment,
  },
  // 执行函数
  execute: async (context, formData: {
    prompt: string;
    referenceImage: Attachment[];
    aspectRatio: string;
    resolution: string;
  }) => {
    const { prompt, referenceImage, aspectRatio, resolution } = formData;

    // ==================== 日志工具 ====================
    function debugLog(arg: any) {
      console.log(JSON.stringify({ arg }), '\n');
    }

    debugLog('=====start=====v3.1-nanobanana2');

    // ==================== fetch 封装 ====================
    const apiFetch = async <T = any>(url: string, init?: any, authId?: string): Promise<T & { _fetchError?: boolean; _errorType?: string }> => {
      debugLog({ [`fetch请求: ${url}`]: { method: init?.method || 'GET', authId } });
      try {
        const res = await context.fetch(url, init, authId);
        const resText = await res.text();
        debugLog({ [`fetch响应: ${url}`]: { status: res.status, ok: res.ok, body: resText.slice(0, 2000) } });

        if (!res.ok) {
          return { code: -1, error: { status: res.status, statusText: res.statusText, body: resText }, _fetchError: true, _errorType: 'HTTP_ERROR' } as any;
        }
        if (!resText || resText.trim().length === 0) {
          return { code: -1, error: { message: '响应体为空' }, _fetchError: true, _errorType: 'EMPTY_RESPONSE' } as any;
        }
        if (resText.trim().startsWith('<')) {
          return { code: -1, error: { message: '响应为HTML非JSON', preview: resText.slice(0, 300) }, _fetchError: true, _errorType: 'HTML_RESPONSE' } as any;
        }
        return JSON.parse(resText);
      } catch (e: any) {
        debugLog({ [`fetch异常: ${url}`]: { error: e?.message || String(e) } });
        return { code: -1, error: { message: e?.message || String(e) }, _fetchError: true, _errorType: 'NETWORK_ERROR' } as any;
      }
    };

    try {
      // ==================== 1. 解析提示词 ====================
      const promptText = typeof prompt === 'string' ? prompt.trim() : String(prompt || '').trim();
      if (!promptText) {
        return { code: FieldExecuteCode.ConfigError, msg: '===配置错误: 提示词为空' };
      }

      // ==================== 2. 解析参考图 ====================
      let referenceImageUrls: string[] = [];
      if (Array.isArray(referenceImage) && referenceImage.length > 0) {
        referenceImageUrls = referenceImage
          .filter(img => img?.tmp_url)
          .map(img => img.tmp_url)
          .slice(0, 5);
      }

      // ==================== 3. 构建请求体 ====================
      const selectedAspectRatio = aspectRatio || '1:1';
      const selectedResolution = resolution || '1K';

      const requestBody: any = {
        service_code: 'image_generation',
        params: {
          prompt: promptText,
          size: selectedResolution,
          aspect_ratio: selectedAspectRatio,
          model: 'nano-banana-2',
        },
      };

      if (referenceImageUrls.length > 0) {
        requestBody.params.image_input = referenceImageUrls;
      }

      debugLog({
        '请求参数': {
          model: 'nano-banana-2',
          prompt: promptText.slice(0, 100),
          size: selectedResolution,
          aspect_ratio: selectedAspectRatio,
          referenceCount: referenceImageUrls.length,
        },
      });

      // ==================== 4. 调用 Bestboy /api/service/invoke ====================
      const API_BASE = 'https://aivip.link';
      const invokeResp = await apiFetch<InvokeResponse>(`${API_BASE}/api/service/invoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }, 'aify_auth');

      debugLog({ 'invoke响应': invokeResp });

      // 处理 fetch 层错误
      if ((invokeResp as any)._fetchError) {
        const errType = (invokeResp as any)._errorType;
        const errDetail = invokeResp.error;
        if (errDetail?.status === 429) {
          return { code: FieldExecuteCode.RateLimit, msg: '===请求频率超限' };
        }
        return { code: FieldExecuteCode.Error, msg: `===请求失败(${errType}): ${errDetail?.message || errDetail?.statusText || '未知错误'}` };
      }

      // 处理业务错误码
      if (invokeResp.code === 40001) {
        return { code: FieldExecuteCode.QuotaExhausted, msg: '===积分不足，请充值后重试' };
      }
      if (invokeResp.code === 40003) {
        return { code: FieldExecuteCode.Error, msg: `===内容审核未通过: ${invokeResp.message || '提示词包含敏感内容'}` };
      }
      if (invokeResp.code !== 0) {
        return { code: FieldExecuteCode.Error, msg: `===服务调用失败: code=${invokeResp.code}, ${invokeResp.message || '未知错误'}` };
      }
      if (!invokeResp.data) {
        return { code: FieldExecuteCode.Error, msg: '===响应数据为空' };
      }

      // ==================== 5. 提取结果或轮询 ====================
      const extractUrl = (data: any): string =>
        data?.image_url || data?.result_url ||
        (data?.image_urls?.length > 0 ? data.image_urls[0] : '') ||
        (data?.result_urls?.length > 0 ? data.result_urls[0] : '') || '';

      const taskId = invokeResp.data.task_id;
      const status = invokeResp.data.status;

      // 如果 invoke 直接返回了成功结果
      if (status === 'completed' || status === 'success') {
        const resultUrl = extractUrl(invokeResp.data);
        if (resultUrl) {
          debugLog({ '直接返回成功': { resultUrl, cost: invokeResp.data.cost } });
          return {
            code: FieldExecuteCode.Success,
            data: [{ fileName: `nanobanana2_${Date.now()}.png`, type: 'image', url: resultUrl }],
          };
        }
      }

      if (status === 'failed') {
        return { code: FieldExecuteCode.Error, msg: `===图片生成失败: ${invokeResp.data.error_msg || invokeResp.data.error_message || '未知错误'}` };
      }

      // 需要轮询（pending/processing）
      if (!taskId) {
        return { code: FieldExecuteCode.Error, msg: '===任务ID为空，无法查询状态' };
      }

      debugLog({ '开始轮询': { taskId, currentStatus: status } });

      const maxAttempts = 60;   // 最多60次
      const pollInterval = 3000; // 每3秒

      for (let i = 0; i < maxAttempts; i++) {
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        const taskResp = await apiFetch<TaskResponse>(`${API_BASE}/api/service/task/${taskId}`, {
          method: 'GET',
          headers: {},
        }, 'aify_auth');

        // 网络错误继续重试
        if ((taskResp as any)._fetchError) {
          debugLog({ [`轮询#${i + 1}网络错误`]: taskResp.error });
          continue;
        }

        if (taskResp.code !== 0 || !taskResp.data) {
          debugLog({ [`轮询#${i + 1}响应异常`]: { code: taskResp.code } });
          continue;
        }

        const taskStatus = taskResp.data.status;

        if (taskStatus === 'completed' || taskStatus === 'success') {
          const resultUrl = extractUrl(taskResp.data);
          if (resultUrl) {
            debugLog({ '轮询成功': { resultUrl, cost: taskResp.data.cost, attempt: i + 1 } });
            return {
              code: FieldExecuteCode.Success,
              data: [{ fileName: `nanobanana2_${Date.now()}.png`, type: 'image', url: resultUrl }],
            };
          }
          return { code: FieldExecuteCode.Error, msg: '===任务完成但未返回图片URL' };
        }

        if (taskStatus === 'failed') {
          return { code: FieldExecuteCode.Error, msg: `===图片生成失败: ${taskResp.data.error_msg || taskResp.data.error_message || '未知错误'}` };
        }

        // pending/processing 继续轮询
        if (i % 5 === 0) {
          debugLog({ [`轮询中#${i + 1}`]: { status: taskStatus, progress: taskResp.data.progress } });
        }
      }

      return { code: FieldExecuteCode.Error, msg: `===生成超时: 已等待${(maxAttempts * pollInterval) / 1000}秒，请稍后重试` };

    } catch (e: any) {
      console.log('====error', String(e));
      return { code: FieldExecuteCode.Error, msg: `===捷径执行异常: ${e?.message || String(e)}` };
    }
  },
});

export default fieldDecoratorKit;
