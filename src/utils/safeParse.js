export default function safeParse(data) {
  try {
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}
