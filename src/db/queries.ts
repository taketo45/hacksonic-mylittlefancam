import { eq, and, desc, asc, like, inArray } from 'drizzle-orm';
import { db } from './index';
import { 
  organizationMst, 
  hostTbl, 
  hostDetailTbl, 
  eventTbl, 
  eventSlotTbl, 
  userTbl, 
  photographerTbl, 
  photoShootTbl, 
  originalPhotoTbl, 
  editedPhotoTbl, 
  processedPhotoTbl, 
  cartTbl, 
  purchaseTbl, 
  printManagementTbl,
  hostEventTbl,
  userParticipationTbl
} from './schema';
import { v4 as uuidv4 } from 'uuid';

// サーバーサイドでのみ実行されるかチェックする関数
const isServer = () => typeof window === 'undefined';

// データベースが利用可能かチェックする関数
const checkDb = () => {
  if (!isServer()) {
    throw new Error('データベース接続はサーバーサイドでのみ利用可能です');
  }
  if (!db) {
    throw new Error('データベース接続が初期化されていません');
  }
  return db;
};

// 組織関連のクエリ
export const organizationQueries = {
  /**
   * 組織を作成する
   * @param data 組織データ
   * @returns 作成された組織
   */
  createOrganization: async (data: {
    organizationName: string;
    organizationAddress?: string;
    organizationContact?: string;
    organizationType?: '保育園' | '幼稚園' | '小学校' | '中学校' | '高校' | 'その他';
    department?: string;
  }) => {
    const dbInstance = checkDb();
    const organizationId = uuidv4();
    return await dbInstance.insert(organizationMst).values({
      organizationId,
      ...data,
    }).returning();
  },

  /**
   * 組織IDで組織を取得する
   * @param organizationId 組織ID
   * @returns 組織情報
   */
  getOrganizationById: async (organizationId: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.organizationMst.findFirst({
      where: eq(organizationMst.organizationId, organizationId),
    });
  },

  /**
   * 組織名で組織を検索する
   * @param name 組織名（部分一致）
   * @returns 組織情報の配列
   */
  searchOrganizationsByName: async (name: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.organizationMst.findMany({
      where: like(organizationMst.organizationName, `%${name}%`),
    });
  },

  /**
   * 組織情報を更新する
   * @param organizationId 組織ID
   * @param data 更新データ
   * @returns 更新された組織情報
   */
  updateOrganization: async (organizationId: string, data: Partial<typeof organizationMst.$inferInsert>) => {
    const dbInstance = checkDb();
    return await dbInstance.update(organizationMst)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizationMst.organizationId, organizationId))
      .returning();
  },
};

// 主催者関連のクエリ
export const hostQueries = {
  /**
   * 主催者を作成する
   * @param data 主催者データ
   * @returns 作成された主催者
   */
  createHost: async (data: {
    name: string;
    email: string;
    password: string;
    accountStatus?: '有効' | '無効' | '停止中' | '審査中';
  }) => {
    const dbInstance = checkDb();
    const hostId = uuidv4();
    return await dbInstance.insert(hostTbl).values({
      hostId,
      ...data,
    }).returning();
  },

  /**
   * 主催者IDで主催者を取得する
   * @param hostId 主催者ID
   * @returns 主催者情報
   */
  getHostById: async (hostId: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.hostTbl.findFirst({
      where: eq(hostTbl.hostId, hostId),
      with: {
        hostDetails: true,
      },
    });
  },

  /**
   * メールアドレスで主催者を取得する
   * @param email メールアドレス
   * @returns 主催者情報
   */
  getHostByEmail: async (email: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.hostTbl.findFirst({
      where: eq(hostTbl.email, email),
    });
  },

  /**
   * 主催者情報を更新する
   * @param hostId 主催者ID
   * @param data 更新データ
   * @returns 更新された主催者情報
   */
  updateHost: async (hostId: string, data: Partial<typeof hostTbl.$inferInsert>) => {
    const dbInstance = checkDb();
    return await dbInstance.update(hostTbl)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(hostTbl.hostId, hostId))
      .returning();
  },

  /**
   * 主催者詳細情報を作成または更新する
   * @param hostId 主催者ID
   * @param data 主催者詳細データ
   * @returns 作成または更新された主催者詳細情報
   */
  upsertHostDetail: async (hostId: string, data: {
    address?: string;
    phoneNumber?: string;
    organizationId?: string;
  }) => {
    const dbInstance = checkDb();
    const existingDetail = await dbInstance.query.hostDetailTbl.findFirst({
      where: eq(hostDetailTbl.hostId, hostId),
    });

    if (existingDetail) {
      return await dbInstance.update(hostDetailTbl)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(hostDetailTbl.hostId, hostId))
        .returning();
    } else {
      return await dbInstance.insert(hostDetailTbl).values({
        hostId,
        ...data,
      }).returning();
    }
  },
};

// イベント関連のクエリ
export const eventQueries = {
  /**
   * イベントを作成する
   * @param data イベントデータ
   * @returns 作成されたイベント
   */
  createEvent: async (data: {
    hostId: string;
    eventName: string;
    eventStatus?: '準備中' | '公開中' | '終了' | 'キャンセル';
    eventRole?: string;
  }) => {
    const dbInstance = checkDb();
    const eventId = uuidv4();
    
    // トランザクションを使用して、イベントとホスト-イベント関連を同時に作成
    return await dbInstance.transaction(async (tx) => {
      const event = await tx.insert(eventTbl).values({
        eventId,
        eventName: data.eventName,
        eventStatus: data.eventStatus,
      }).returning();

      await tx.insert(hostEventTbl).values({
        hostId: data.hostId,
        eventId,
        eventRole: data.eventRole,
      });

      return event;
    });
  },

  /**
   * イベントIDでイベントを取得する
   * @param eventId イベントID
   * @returns イベント情報
   */
  getEventById: async (eventId: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.eventTbl.findFirst({
      where: eq(eventTbl.eventId, eventId),
      with: {
        eventSlots: true,
        hostEvents: {
          with: {
            host: true,
          },
        },
      },
    });
  },

  /**
   * 主催者IDに関連するイベントを取得する
   * @param hostId 主催者ID
   * @returns イベント情報の配列
   */
  getEventsByHostId: async (hostId: string) => {
    const dbInstance = checkDb();
    // hostEventTblを経由してイベントを取得
    const hostEvents = await dbInstance.query.hostEventTbl.findMany({
      where: eq(hostEventTbl.hostId, hostId),
      with: {
        event: {
          with: {
            eventSlots: true,
          },
        },
      },
    });

    // 結果を整形して返す
    return hostEvents.map(he => he.event);
  },

  /**
   * イベント情報を更新する
   * @param eventId イベントID
   * @param data 更新データ
   * @returns 更新されたイベント情報
   */
  updateEvent: async (eventId: string, data: Partial<typeof eventTbl.$inferInsert>) => {
    const dbInstance = checkDb();
    return await dbInstance.update(eventTbl)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(eventTbl.eventId, eventId))
      .returning();
  },

  /**
   * イベント枠を作成する
   * @param data イベント枠データ
   * @returns 作成されたイベント枠
   */
  createEventSlot: async (data: {
    eventId: string;
    eventSlotName: string;
    eventDate?: string;
    eventTime?: string;
    facilityId?: string;
    geoCode?: string;
    eventSlotDetail?: string;
    eventSlotStatus?: '準備中' | '公開中' | '終了' | 'キャンセル';
    ticketUrl?: string;
  }) => {
    const dbInstance = checkDb();
    const eventSlotId = uuidv4();
    return await dbInstance.insert(eventSlotTbl).values({
      eventSlotId,
      ...data,
    }).returning();
  },

  /**
   * イベント枠IDでイベント枠を取得する
   * @param eventSlotId イベント枠ID
   * @returns イベント枠情報
   */
  getEventSlotById: async (eventSlotId: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.eventSlotTbl.findFirst({
      where: eq(eventSlotTbl.eventSlotId, eventSlotId),
      with: {
        event: true,
      },
    });
  },

  /**
   * イベントIDに関連するイベント枠を取得する
   * @param eventId イベントID
   * @returns イベント枠情報の配列
   */
  getEventSlotsByEventId: async (eventId: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.eventSlotTbl.findMany({
      where: eq(eventSlotTbl.eventId, eventId),
    });
  },

  /**
   * イベント枠情報を更新する
   * @param eventSlotId イベント枠ID
   * @param data 更新データ
   * @returns 更新されたイベント枠情報
   */
  updateEventSlot: async (eventSlotId: string, data: Partial<typeof eventSlotTbl.$inferInsert>) => {
    const dbInstance = checkDb();
    return await dbInstance.update(eventSlotTbl)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(eventSlotTbl.eventSlotId, eventSlotId))
      .returning();
  },
};

// ユーザー関連のクエリ
export const userQueries = {
  /**
   * ユーザーを作成する
   * @param data ユーザーデータ
   * @returns 作成されたユーザー
   */
  createUser: async (data: {
    name: string;
    email: string;
    password: string;
    accountStatus?: '有効' | '無効' | '停止中' | '審査中';
  }) => {
    const dbInstance = checkDb();
    const userId = uuidv4();
    return await dbInstance.insert(userTbl).values({
      userId,
      ...data,
    }).returning();
  },

  /**
   * ユーザーIDでユーザーを取得する
   * @param userId ユーザーID
   * @returns ユーザー情報
   */
  getUserById: async (userId: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.userTbl.findFirst({
      where: eq(userTbl.userId, userId),
    });
  },

  /**
   * メールアドレスでユーザーを取得する
   * @param email メールアドレス
   * @returns ユーザー情報
   */
  getUserByEmail: async (email: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.userTbl.findFirst({
      where: eq(userTbl.email, email),
    });
  },

  /**
   * ユーザー情報を更新する
   * @param userId ユーザーID
   * @param data 更新データ
   * @returns 更新されたユーザー情報
   */
  updateUser: async (userId: string, data: Partial<typeof userTbl.$inferInsert>) => {
    const dbInstance = checkDb();
    return await dbInstance.update(userTbl)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userTbl.userId, userId))
      .returning();
  },

  /**
   * ユーザーのイベント参加情報を登録する
   * @param data 参加情報データ
   * @returns 作成された参加情報
   */
  createUserParticipation: async (data: {
    userId: string;
    eventSlotId: string;
    facilityId?: string;
    seatBlockId?: string;
    seatLineId?: string;
    seatRowId?: string;
  }) => {
    const dbInstance = checkDb();
    return await dbInstance.insert(userParticipationTbl).values(data).returning();
  },
};

// 写真関連のクエリ
export const photoQueries = {
  /**
   * 撮影情報を作成する
   * @param data 撮影情報データ
   * @returns 作成された撮影情報
   */
  createPhotoShoot: async (data: {
    eventSlotId?: string;
    photographerId?: string;
    storageUrl?: string;
  }) => {
    const dbInstance = checkDb();
    const shootId = uuidv4();
    return await dbInstance.insert(photoShootTbl).values({
      shootId,
      ...data,
    }).returning();
  },

  /**
   * オリジナル写真を作成する
   * @param data オリジナル写真データ
   * @returns 作成されたオリジナル写真
   */
  createOriginalPhoto: async (data: {
    shootId?: string;
    storageUrl: string;
    userPreference?: string;
    geoCode?: string;
    shootDateTime?: Date;
    isNG?: boolean;
  }) => {
    const dbInstance = checkDb();
    const originalPhotoId = uuidv4();
    return await dbInstance.insert(originalPhotoTbl).values({
      originalPhotoId,
      ...data,
    }).returning();
  },

  /**
   * 編集済み写真を作成する
   * @param data 編集済み写真データ
   * @returns 作成された編集済み写真
   */
  createEditedPhoto: async (data: {
    originalPhotoId: string;
    storageUrl: string;
    editDateTime?: Date;
    userPreference?: string;
  }) => {
    const dbInstance = checkDb();
    const editedPhotoId = uuidv4();
    return await dbInstance.insert(editedPhotoTbl).values({
      editedPhotoId,
      ...data,
    }).returning();
  },

  /**
   * 加工済み写真を作成する
   * @param data 加工済み写真データ
   * @returns 作成された加工済み写真
   */
  createProcessedPhoto: async (data: {
    userId?: string;
    editedPhotoId: string;
    frameCoordinate?: string;
    wipeCoordinate?: string;
    editSettingsJson?: string;
    processDateTime?: Date;
    processedPhotoUrl?: string;
    isSold?: boolean;
    isDownloaded?: boolean;
    isPrinted?: boolean;
  }) => {
    const dbInstance = checkDb();
    const processedPhotoId = uuidv4();
    return await dbInstance.insert(processedPhotoTbl).values({
      processedPhotoId,
      ...data,
    }).returning();
  },

  /**
   * ユーザーIDに関連する加工済み写真を取得する
   * @param userId ユーザーID
   * @returns 加工済み写真情報の配列
   */
  getProcessedPhotosByUserId: async (userId: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.processedPhotoTbl.findMany({
      where: eq(processedPhotoTbl.userId, userId),
      with: {
        editedPhoto: {
          with: {
            originalPhoto: true,
          },
        },
      },
    });
  },

  /**
   * 編集済み写真IDに関連する加工済み写真を取得する
   * @param editedPhotoId 編集済み写真ID
   * @returns 加工済み写真情報の配列
   */
  getProcessedPhotosByEditedPhotoId: async (editedPhotoId: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.processedPhotoTbl.findMany({
      where: eq(processedPhotoTbl.editedPhotoId, editedPhotoId),
    });
  },

  /**
   * 加工済み写真情報を更新する
   * @param processedPhotoId 加工済み写真ID
   * @param data 更新データ
   * @returns 更新された加工済み写真情報
   */
  updateProcessedPhoto: async (processedPhotoId: string, data: Partial<typeof processedPhotoTbl.$inferInsert>) => {
    const dbInstance = checkDb();
    return await dbInstance.update(processedPhotoTbl)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(processedPhotoTbl.processedPhotoId, processedPhotoId))
      .returning();
  },
};

// カート・購入関連のクエリ
export const purchaseQueries = {
  /**
   * カートに商品を追加する
   * @param data カートデータ
   * @returns 作成されたカート情報
   */
  addToCart: async (data: {
    userId: string;
    processedPhotoId: string;
  }) => {
    const dbInstance = checkDb();
    return await dbInstance.insert(cartTbl).values(data).returning();
  },

  /**
   * ユーザーIDに関連するカート情報を取得する
   * @param userId ユーザーID
   * @returns カート情報の配列
   */
  getCartByUserId: async (userId: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.cartTbl.findMany({
      where: eq(cartTbl.userId, userId),
      with: {
        processedPhoto: {
          with: {
            editedPhoto: {
              with: {
                originalPhoto: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * カートから商品を削除する
   * @param id カートID
   * @returns 削除結果
   */
  removeFromCart: async (id: number) => {
    const dbInstance = checkDb();
    return await dbInstance.delete(cartTbl)
      .where(eq(cartTbl.id, id))
      .returning();
  },

  /**
   * 購入情報を作成する
   * @param data 購入データ
   * @returns 作成された購入情報
   */
  createPurchase: async (data: {
    userId: string;
    processedPhotoId: string;
    amount?: string;
    currency?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentId?: string;
  }) => {
    const dbInstance = checkDb();
    const purchaseId = uuidv4();
    return await dbInstance.insert(purchaseTbl).values({
      purchaseId,
      ...data,
    }).returning();
  },

  /**
   * 購入IDで購入情報を取得する
   * @param purchaseId 購入ID
   * @returns 購入情報
   */
  getPurchaseById: async (purchaseId: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.purchaseTbl.findFirst({
      where: eq(purchaseTbl.purchaseId, purchaseId),
      with: {
        user: true,
        processedPhoto: {
          with: {
            editedPhoto: {
              with: {
                originalPhoto: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * ユーザーIDに関連する購入情報を取得する
   * @param userId ユーザーID
   * @returns 購入情報の配列
   */
  getPurchasesByUserId: async (userId: string) => {
    const dbInstance = checkDb();
    return await dbInstance.query.purchaseTbl.findMany({
      where: eq(purchaseTbl.userId, userId),
      with: {
        processedPhoto: true,
      },
    });
  },

  /**
   * 印刷管理情報を作成する
   * @param data 印刷管理データ
   * @returns 作成された印刷管理情報
   */
  createPrintManagement: async (data: {
    purchaseId: string;
    userId: string;
    processedPhotoId: string;
    processedPhotoUrl?: string;
    status?: '準備中' | '印刷中' | '印刷完了' | '発送準備中' | '発送完了' | 'キャンセル' | 'エラー';
  }) => {
    const dbInstance = checkDb();
    return await dbInstance.insert(printManagementTbl).values(data).returning();
  },

  /**
   * 印刷管理情報を更新する
   * @param id 印刷管理ID
   * @param data 更新データ
   * @returns 更新された印刷管理情報
   */
  updatePrintManagement: async (id: number, data: Partial<typeof printManagementTbl.$inferInsert>) => {
    const dbInstance = checkDb();
    return await dbInstance.update(printManagementTbl)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(printManagementTbl.id, id))
      .returning();
  },
}; 