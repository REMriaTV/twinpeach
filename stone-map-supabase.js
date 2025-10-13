// Supabase設定
import { createClient } from '@supabase/supabase-js'

// Supabase接続情報（実際の値に置き換えてください）
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 石の場所データを取得
async function fetchStoneLocations() {
    try {
        // 場所データを取得
        const { data: locations, error: locError } = await supabase
            .from('stone_locations')
            .select(`
                *,
                location_stones (
                    stone_id,
                    stones (*)
                )
            `)
            .order('created_at', { ascending: false })

        if (locError) throw locError

        // データを整形
        const formattedLocations = locations.map(location => ({
            id: location.id,
            prefecture: location.prefecture,
            location_name: location.location_name,
            location_type: location.location_type,
            detail_type_river: location.detail_type_river,
            detail_type_ocean: location.detail_type_ocean,
            detail_notes: location.detail_notes,
            city: location.city,
            address: location.address,
            lat: location.lat,
            lng: location.lng,
            display_name_full: location.display_name_full,
            display_name_simple: location.display_name_simple,
            stones: location.location_stones.map(ls => ls.stones)
        }))

        return formattedLocations
    } catch (error) {
        console.error('Error fetching stone locations:', error)
        return []
    }
}

// 石データを取得
async function fetchStones() {
    try {
        const { data, error } = await supabase
            .from('stones')
            .select('*')
            .order('name')

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error fetching stones:', error)
        return []
    }
}

// 新しい場所を追加
async function addStoneLocation(locationData) {
    try {
        const { data, error } = await supabase
            .from('stone_locations')
            .insert([locationData])
            .select()

        if (error) throw error
        return data[0]
    } catch (error) {
        console.error('Error adding location:', error)
        return null
    }
}

// 場所に石を関連付け
async function linkStoneToLocation(locationId, stoneId) {
    try {
        const { data, error } = await supabase
            .from('location_stones')
            .insert([{
                location_id: locationId,
                stone_id: stoneId
            }])
            .select()

        if (error) throw error
        return data[0]
    } catch (error) {
        console.error('Error linking stone to location:', error)
        return null
    }
}

// エクスポート
export {
    supabase,
    fetchStoneLocations,
    fetchStones,
    addStoneLocation,
    linkStoneToLocation
}