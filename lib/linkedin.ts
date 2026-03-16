export interface ImagePayload {
  data: string;   // base64-encoded image bytes
  mimeType: string;
}

/**
 * Registers an image upload with LinkedIn and uploads the bytes.
 * Returns the LinkedIn asset URN (e.g. "urn:li:digitalmediaAsset:XXX").
 */
async function uploadImageToLinkedIn(
  accessToken: string,
  memberId: string,
  image: ImagePayload
): Promise<string> {
  // Step 1: register the upload
  const registerRes = await fetch(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: `urn:li:person:${memberId}`,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      }),
    }
  );

  if (!registerRes.ok) {
    const body = await registerRes.text();
    throw new Error(`LinkedIn asset register failed ${registerRes.status}: ${body}`);
  }

  const registerData = await registerRes.json();
  const assetUrn: string = registerData.value.asset;
  const uploadUrl: string =
    registerData.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ].uploadUrl;

  // Step 2: upload the image bytes
  const imageBytes = Buffer.from(image.data, "base64");
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": image.mimeType,
    },
    body: imageBytes,
  });

  if (!uploadRes.ok) {
    const body = await uploadRes.text();
    throw new Error(`LinkedIn image upload failed ${uploadRes.status}: ${body}`);
  }

  return assetUrn;
}

/**
 * Posts content (with optional images) to LinkedIn using the UGC Posts API.
 * Returns the LinkedIn post URN on success, throws on failure.
 */
export async function postToLinkedIn(
  accessToken: string,
  linkedInMemberId: string,
  content: string,
  images: ImagePayload[] = []
): Promise<string> {
  // Upload all images first
  const assetUrns = await Promise.all(
    images.map((img) => uploadImageToLinkedIn(accessToken, linkedInMemberId, img))
  );

  const hasImages = assetUrns.length > 0;

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:person:${linkedInMemberId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: hasImages ? "IMAGE" : "NONE",
          ...(hasImages && {
            media: assetUrns.map((urn) => ({
              status: "READY",
              media: urn,
              description: { text: "" },
              title: { text: "" },
            })),
          }),
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LinkedIn API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.id ?? "unknown";
}
