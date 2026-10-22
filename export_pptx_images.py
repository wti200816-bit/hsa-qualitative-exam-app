import os, sys
import win32com.client

sys.stdout.reconfigure(encoding='utf-8')

def export_pptx(pptx_path, out_dir):
    abs_pptx = os.path.abspath(pptx_path)
    abs_out = os.path.abspath(out_dir)
    os.makedirs(abs_out, exist_ok=True)
    
    ppt = win32com.client.Dispatch("PowerPoint.Application")
    # ppt.Visible = 1
    prs = ppt.Presentations.Open(abs_pptx, ReadOnly=True, Untitled=False, WithWindow=False)
    
    for idx, slide in enumerate(prs.Slides):
        out_file = os.path.join(abs_out, f"slide_{idx+1}.png")
        slide.Export(out_file, "PNG", 1920, 1080)
        print(f"Exported Slide {idx+1} to {out_file}")
        
    prs.Close()
    ppt.Quit()

if __name__ == '__main__':
    export_pptx(r"E:\AI\dự thi.pptx", r"E:\AI\slides_original")
