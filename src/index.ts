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
      'err_fetch': '网络请求失败，请检查网络后重试',
      'err_content': '内容审核未通过，请修改提示词后重试',
      'err_service': 'AI 服务调用失败，请稍后重试',
      'err_empty': '服务返回数据为空，请稍后重试',
      'err_generate': '图片生成失败，请修改提示词后重试',
      'err_no_task': '任务创建失败，请稍后重试',
      'err_no_url': '图片地址获取失败，请稍后重试',
      'err_timeout': '图片生成超时，请稍后重试',
      'err_unknown': '插件执行异常，请联系开发者',
      'err_quota': 'AIFY 积分不足，请前往 https://aivip.link 充值后重试',
    },
    'en-US': {
      'promptLabel': 'Image Generation Prompt',
      'promptPlaceholder': 'Enter your image generation prompt',
      'referenceImageLabel': 'Reference Image',
      'aspectRatioLabel': 'Aspect Ratio',
      'resolutionLabel': 'Resolution',
      'authorizationName': 'AIFY API Authorization',
      'authorizationTooltip': 'Visit https://aivip.link/dashboard/apikey to get your API Key.',
      'err_fetch': 'Network request failed, please check your connection and retry',
      'err_content': 'Content moderation failed, please revise your prompt',
      'err_service': 'AI service error, please try again later',
      'err_empty': 'Empty response from service, please try again later',
      'err_generate': 'Image generation failed, please revise your prompt',
      'err_no_task': 'Task creation failed, please try again later',
      'err_no_url': 'Failed to retrieve image URL, please try again later',
      'err_timeout': 'Image generation timed out, please try again later',
      'err_unknown': 'Plugin execution error, please contact the developer',
      'err_quota': 'Insufficient AIFY credits, please recharge at https://aivip.link',
    },
    'ja-JP': {
      'promptLabel': '画像生成プロンプト',
      'promptPlaceholder': '画像生成プロンプトを入力してください',
      'referenceImageLabel': '参考画像',
      'aspectRatioLabel': 'アスペクト比',
      'resolutionLabel': '解像度',
      'authorizationName': 'AIFY API 認証',
      'authorizationTooltip': 'https://aivip.link/dashboard/apikey でAPIキーを取得してください。',
      'err_fetch': 'ネットワークエラー、接続を確認してから再試行してください',
      'err_content': 'コンテンツ審査不通過、プロンプトを修正してください',
      'err_service': 'AIサービスエラー、しばらくしてから再試行してください',
      'err_empty': 'サービスの応答が空です、後でもう一度お試しください',
      'err_generate': '画像生成失敗、プロンプトを修正してください',
      'err_no_task': 'タスク作成失敗、後でもう一度お試しください',
      'err_no_url': '画像URL取得失敗、後でもう一度お試しください',
      'err_timeout': '画像生成タイムアウト、後でもう一度お試しください',
      'err_unknown': 'プラグイン実行エラー、開発者にお問い合わせください',
      'err_quota': 'AIFYのポイントが不足しています、https://aivip.link でチャージしてください',
    },
  },
  // 用户可见的错误信息映射（errorMessage 对应的展示文案）
  errorMessages: {
    err_fetch: t('err_fetch'),
    err_content: t('err_content'),
    err_service: t('err_service'),
    err_empty: t('err_empty'),
    err_generate: t('err_generate'),
    err_no_task: t('err_no_task'),
    err_no_url: t('err_no_url'),
    err_timeout: t('err_timeout'),
    err_unknown: t('err_unknown'),
    err_quota: t('err_quota'),
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
  // 返回链接类型（图片直链，绕过 COS 防盗链限制）
  resultType: {
    type: FieldType.Link,
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
          return { code: FieldExecuteCode.RateLimit };
        }
        return {
          code: FieldExecuteCode.Error,
          errorMessage: 'err_fetch',
          extra: { type: errType, detail: String(errDetail?.message || errDetail?.statusText || '') },
        };
      }

      // 处理业务错误码
      // 40001 / 300202 均为积分不足
      if (invokeResp.code === 40001 || invokeResp.code === 300202) {
        return { code: FieldExecuteCode.Error, errorMessage: 'err_quota' };
      }
      if (invokeResp.code === 40003) {
        return {
          code: FieldExecuteCode.Error,
          errorMessage: 'err_content',
          extra: { detail: invokeResp.message || '' },
        };
      }
      if (invokeResp.code !== 0) {
        return {
          code: FieldExecuteCode.Error,
          errorMessage: 'err_service',
          extra: { code: String(invokeResp.code), detail: invokeResp.message || '' },
        };
      }
      if (!invokeResp.data) {
        return { code: FieldExecuteCode.Error, errorMessage: 'err_empty' };
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
            data: { text: 'AI生成图片', link: resultUrl },
          };
        }
        return { code: FieldExecuteCode.Error, errorMessage: 'err_no_url' };
      }

      if (status === 'failed') {
        return {
          code: FieldExecuteCode.Error,
          errorMessage: 'err_generate',
          extra: { detail: invokeResp.data.error_msg || invokeResp.data.error_message || '' },
        };
      }

      // 需要轮询（pending/processing）
      if (!taskId) {
        return { code: FieldExecuteCode.Error, errorMessage: 'err_no_task' };
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
          // 轮询期间遇到积分不足，立即终止
          if (taskResp.code === 40001 || taskResp.code === 300202) {
            return { code: FieldExecuteCode.Error, errorMessage: 'err_quota' };
          }
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
              data: { text: 'AI生成图片', link: resultUrl },
            };
          }
          return { code: FieldExecuteCode.Error, errorMessage: 'err_no_url' };
        }

        if (taskStatus === 'failed') {
          return {
            code: FieldExecuteCode.Error,
            errorMessage: 'err_generate',
            extra: { detail: taskResp.data.error_msg || taskResp.data.error_message || '' },
          };
        }

        // pending/processing 继续轮询
        if (i % 5 === 0) {
          debugLog({ [`轮询中#${i + 1}`]: { status: taskStatus, progress: taskResp.data.progress } });
        }
      }

      return {
        code: FieldExecuteCode.Error,
        errorMessage: 'err_timeout',
        extra: { waited: `${(maxAttempts * pollInterval) / 1000}s` },
      };

    } catch (e: any) {
      debugLog({ '===异常错误': { message: e?.message, stack: e?.stack?.slice(0, 500) } });
      return {
        code: FieldExecuteCode.Error,
        errorMessage: 'err_unknown',
        extra: { detail: e?.message || String(e) },
      };
    }
  },
});

export default fieldDecoratorKit;
