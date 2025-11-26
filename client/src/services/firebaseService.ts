import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  UserProfile,
  LogEntry,
  AssessmentResult,
  CBTLesson,
  CommunityPost,
  CommitmentContract,
  Badge,
  JITAI,
  Comment,
} from '../types';

const removeUndefined = <T extends Record<string, unknown>>(data: T): T => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      const cleaned = removeUndefined(value as Record<string, unknown>);
      if (Object.keys(cleaned).length > 0) {
        result[key] = cleaned;
      }
    } else {
      result[key] = value;
    }
  }
  return result as T;
};

// User Profile Operations
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const createUserProfile = async (uid: string, profile: Partial<UserProfile>): Promise<void> => {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, {
      ...removeUndefined(profile),
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      tokens: 0,
      badges: [],
      selfRewards: [],
      completedLessons: [],
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...removeUndefined(updates),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Assessment Operations
export const saveAssessment = async (uid: string, assessment: AssessmentResult): Promise<void> => {
  try {
    await updateUserProfile(uid, { assessment });
  } catch (error) {
    console.error('Error saving assessment:', error);
    throw error;
  }
};

// Log Operations
export const createLogEntry = async (
  uid: string,
  logEntry: Omit<LogEntry, 'id' | 'userId' | 'timestamp'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'logs'), {
      ...removeUndefined(logEntry),
      userId: uid,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating log entry:', error);
    throw error;
  }
};

export const getUserLogs = async (
  uid: string,
  startDate?: Date,
  endDate?: Date,
  limitCount: number = 100
): Promise<LogEntry[]> => {
  try {
    const q = query(
      collection(db, 'logs'),
      where('userId', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
    })) as LogEntry[];

    // Filter by date if provided
    if (startDate || endDate) {
      return logs.filter(log => {
        const logDate = new Date(log.timestamp);
        if (startDate && logDate < startDate) return false;
        if (endDate && logDate > endDate) return false;
        return true;
      });
    }

    return logs;
  } catch (error) {
    console.error('Error getting user logs:', error);
    throw error;
  }
};

// CBT Lessons Operations
export const getCBTLessons = async (): Promise<CBTLesson[]> => {
  try {
    const q = query(collection(db, 'cbtLessons'), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CBTLesson[];
  } catch (error) {
    console.error('Error getting CBT lessons:', error);
    throw error;
  }
};

export const unlockCBTLesson = async (uid: string, lessonId: string): Promise<void> => {
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) throw new Error('User profile not found');

    // Update lesson unlocked status (could be stored in user profile or lesson document)
    const lessonRef = doc(db, 'cbtLessons', lessonId);
    await updateDoc(lessonRef, {
      unlocked: true,
    });
  } catch (error) {
    console.error('Error unlocking CBT lesson:', error);
    throw error;
  }
};

export const markLessonCompleted = async (uid: string, lessonId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      completedLessons: arrayUnion(lessonId),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking lesson completed:', error);
    throw error;
  }
};

// Community Operations
export const getCommunityPosts = async (
  stage?: CommunityPost['stage'],
  limitCount: number = 20
): Promise<CommunityPost[]> => {
  try {
    let q = query(
      collection(db, 'communityPosts'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (stage) {
      q = query(
        collection(db, 'communityPosts'),
        where('stage', '==', stage),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      likedBy: doc.data().likedBy || [],
      likedDevices: doc.data().likedDevices || [],
      comments: doc.data().comments || [],
    })) as CommunityPost[];
  } catch (error) {
    console.error('Error getting community posts:', error);
    throw error;
  }
};

export const createCommunityPost = async (
  uid: string,
  post: Omit<CommunityPost, 'id' | 'userId' | 'createdAt' | 'likes' | 'comments' | 'likedBy' | 'likedDevices'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'communityPosts'), {
      ...post,
      userId: uid,
      likes: 0,
      comments: [],
      likedBy: [],
      likedDevices: [],
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating community post:', error);
    throw error;
  }
};

export const likeCommunityPost = async (postId: string, uid: string, deviceId?: string | null): Promise<void> => {
  try {
    const postRef = doc(db, 'communityPosts', postId);
    const snapshot = await getDoc(postRef);
    if (!snapshot.exists()) {
      throw new Error('Post not found');
    }

    const data = snapshot.data() as CommunityPost;
    const likedBy = data.likedBy || [];
    const likedDevices = data.likedDevices || [];
    if (likedBy.includes(uid) || (deviceId && likedDevices.includes(deviceId))) {
      throw new Error('already-liked');
    }

    await updateDoc(postRef, removeUndefined({
      likedBy: arrayUnion(uid),
      likedDevices: deviceId ? arrayUnion(deviceId) : undefined,
      likes: increment(1),
    }));
  } catch (error) {
    console.error('Error liking community post:', error);
    throw error;
  }
};

export const addCommunityComment = async (
  postId: string,
  comment: Omit<Comment, 'id' | 'createdAt'>
): Promise<void> => {
  try {
    const postRef = doc(db, 'communityPosts', postId);
    const newComment = {
      ...comment,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
    };
    await updateDoc(postRef, {
      comments: arrayUnion(newComment),
    });
  } catch (error) {
    console.error('Error adding community comment:', error);
    throw error;
  }
};

// Commitment Contract Operations
export const createCommitmentContract = async (
  uid: string,
  contract: Omit<CommitmentContract, 'id' | 'userId' | 'status' | 'violations'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'commitmentContracts'), {
      ...contract,
      userId: uid,
      status: 'active',
      violations: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating commitment contract:', error);
    throw error;
  }
};

export const getUserCommitmentContract = async (uid: string): Promise<CommitmentContract | null> => {
  try {
    const q = query(
      collection(db, 'commitmentContracts'),
      where('userId', '==', uid),
      where('status', '==', 'active'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as CommitmentContract;
  } catch (error) {
    console.error('Error getting commitment contract:', error);
    throw error;
  }
};

// Badge Operations
export const unlockBadge = async (uid: string, badge: Badge): Promise<void> => {
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) throw new Error('User profile not found');

    const updatedBadges = [...(userProfile.badges || []), {
      ...badge,
      unlocked: true,
      unlockedAt: new Date().toISOString(),
    }];

    await updateUserProfile(uid, { badges: updatedBadges });
  } catch (error) {
    console.error('Error unlocking badge:', error);
    throw error;
  }
};

// JITAI Operations
export const createJITAI = async (uid: string, jitai: Omit<JITAI, 'id' | 'userId' | 'delivered'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'jitais'), {
      ...jitai,
      userId: uid,
      delivered: false,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating JITAI:', error);
    throw error;
  }
};

export const getUserJITAIs = async (uid: string, delivered?: boolean): Promise<JITAI[]> => {
  try {
    let q = query(
      collection(db, 'jitais'),
      where('userId', '==', uid),
      orderBy('scheduledTime', 'desc')
    );

    if (delivered !== undefined) {
      q = query(
        collection(db, 'jitais'),
        where('userId', '==', uid),
        where('delivered', '==', delivered),
        orderBy('scheduledTime', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledTime: doc.data().scheduledTime?.toDate?.()?.toISOString() || doc.data().scheduledTime,
      deliveredAt: doc.data().deliveredAt?.toDate?.()?.toISOString() || doc.data().deliveredAt,
    })) as JITAI[];
  } catch (error) {
    console.error('Error getting JITAIs:', error);
    throw error;
  }
};

